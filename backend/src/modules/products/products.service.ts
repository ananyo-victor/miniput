import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRODUCT_BRANDS,
  ProductBrand,
} from './entities/product.entity';

const normalizeImageUrls = (imageValue: any) => {
  if (Array.isArray(imageValue)) {
    return imageValue
      .filter((url) => typeof url === 'string' && url.trim() !== '')
      .map((url) => url.trim());
  }

  if (typeof imageValue === 'string' && imageValue.trim() !== '') {
    return [imageValue.trim()];
  }

  return null;
};

const normalizeSize = (sizeValue: any): number[] => {
  if (!Array.isArray(sizeValue)) {
    return [];
  }

  return sizeValue
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);
};

const roundPrice = (value: number): number =>
  Math.round(Math.max(0, value) * 100) / 100;

const normalizeDiscountType = (discountTypeValue: any): DiscountType | null => {
  if (typeof discountTypeValue !== 'string') {
    return null;
  }

  const normalizedType = discountTypeValue.trim().toLowerCase();

  if (!DISCOUNT_TYPES.includes(normalizedType as DiscountType)) {
    return null;
  }

  return normalizedType as DiscountType;
};

const normalizeDiscountValue = (discountValue: any): number | null => {
  if (discountValue === null || discountValue === undefined || discountValue === '') {
    return null;
  }

  const parsedValue = Number(discountValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return roundPrice(parsedValue);
};

const normalizeBrand = (brandValue?: string): ProductBrand | null => {
  if (typeof brandValue !== 'string' || !brandValue.trim()) {
    return null;
  }

  const normalizedInput = brandValue.trim().toLowerCase();
  const matchedBrand = PRODUCT_BRANDS.find(
    (brand) => brand.toLowerCase() === normalizedInput,
  );

  if (!matchedBrand) {
    throw new Error(
      `Invalid brand. Allowed values: ${PRODUCT_BRANDS.join(', ')}`,
    );
  }

  return matchedBrand;
};

const getSizeRange = (size: any): string | null => {
  const normalizedSize = normalizeSize(size);

  if (!normalizedSize.length) {
    return null;
  }

  return `${normalizedSize[0]}-${normalizedSize[normalizedSize.length - 1]}`;
};

const buildDiscountMeta = (product: any) => {
  const originalPrice = roundPrice(Number(product?.price) || 0);
  const discountType = normalizeDiscountType(product?.discountType);
  const discountValue = normalizeDiscountValue(product?.discountValue);

  const isEligibleDiscount =
    !!discountType && discountValue !== null && discountValue > 0;

  let discountAmount = 0;

  if (isEligibleDiscount) {
    discountAmount =
      discountType === 'percent'
        ? (originalPrice * discountValue) / 100
        : discountValue;
  }

  discountAmount = roundPrice(Math.min(originalPrice, discountAmount));

  const finalPrice = roundPrice(originalPrice - discountAmount);
  const discountPercent =
    originalPrice > 0 ? roundPrice((discountAmount / originalPrice) * 100) : 0;

  return {
    discountType,
    discountValue,
    isDiscountActive: isEligibleDiscount,
    originalPrice,
    finalPrice,
    discountAmount,
    discountPercent,
    discountLabel: isEligibleDiscount
      ? discountType === 'percent'
        ? `${Math.round(discountValue || 0)}% OFF`
        : `Rs ${discountAmount} OFF`
      : null,
  };
};

const validateDiscountConfig = ({
  price,
  discountType,
  discountValue,
}: {
  price: number;
  discountType: DiscountType | null;
  discountValue: number | null;
}) => {
  if (!discountType && discountValue !== null) {
    throw new Error('discountType is required when discountValue is set');
  }

  if (discountType && discountValue === null) {
    throw new Error('discountValue is required when discountType is set');
  }

  if (discountType === 'percent' && discountValue !== null && discountValue > 90) {
    throw new Error('Percent discount cannot be greater than 90');
  }

  if (discountType === 'fixed' && discountValue !== null && discountValue > price) {
    throw new Error('Fixed discount cannot be greater than product price');
  }
};

const mapProductRow = (product: any) => {
  const normalizedSize = normalizeSize(product?.size);
  const discountMeta = buildDiscountMeta(product);

  return {
    ...product,
    price: roundPrice(Number(product?.price) || 0),
    discountType: discountMeta.discountType,
    discountValue: discountMeta.discountValue,
    size: normalizedSize,
    imageUrls: product?.imageUrl || [],
    imageUrl: product?.imageUrl?.[0] || null,
    piecesPerPack: normalizedSize.length || product?.piecesPerPack,
    sizeRange: getSizeRange(normalizedSize),
    ...discountMeta,
  };
};

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly uploadsService: UploadsService) {}

  async onModuleInit() {
    await this.ensureDiscountColumnsExist();
    await this.ensureSizeColumnIsIntegerArray();
  }

  private async ensureDiscountColumnsExist() {
    try {
      await pool.query(
        `
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS "discountType" text,
        ADD COLUMN IF NOT EXISTS "discountValue" numeric(10,2)
        `,
      );

      await pool.query(
        `
        ALTER TABLE products
        DROP CONSTRAINT IF EXISTS products_discount_window_check,
        DROP COLUMN IF EXISTS "discountStartAt",
        DROP COLUMN IF EXISTS "discountEndAt"
        `,
      );

      await pool.query(
        `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'products_discount_type_check'
          ) THEN
            ALTER TABLE products
            ADD CONSTRAINT products_discount_type_check
            CHECK ("discountType" IN ('percent', 'fixed') OR "discountType" IS NULL);
          END IF;

          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'products_discount_value_check'
          ) THEN
            ALTER TABLE products
            ADD CONSTRAINT products_discount_value_check
            CHECK ("discountValue" IS NULL OR "discountValue" >= 0);
          END IF;

        END $$
        `,
      );

      this.logger.log('Ensured products discount columns and constraints');
    } catch (error) {
      this.logger.warn(
        `Could not ensure products discount columns: ${error.message}`,
      );
    }
  }

  private async ensureSizeColumnIsIntegerArray() {
    try {
      const { rows } = await pool.query(
        `
        SELECT udt_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'products'
          AND column_name = 'size'
        LIMIT 1
        `,
      );

      if (!rows.length) {
        return;
      }

      if (rows[0].udt_name === '_int4') {
        return;
      }

      await pool.query(
        `
        ALTER TABLE products
        ALTER COLUMN "size" TYPE integer[]
        USING (
          ARRAY(
            SELECT TRUNC(TRIM(value_txt)::numeric)::integer
            FROM unnest(COALESCE("size"::text[], ARRAY[]::text[])) AS value_txt
            WHERE TRIM(value_txt) ~ '^-?\\d+(\\.\\d+)?$'
          )
        )
        `,
      );

      this.logger.log('Converted products.size column to integer[]');
    } catch (error) {
      this.logger.warn(
        `Could not convert products.size column to integer[]: ${error.message}`,
      );
    }
  }

  async getAllProducts(includeHidden: boolean, brandInput?: string) {
    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const values: any[] = [];

    if (!includeHidden) {
      values.push(false);
      conditions.push(`"isHidden" = $${values.length}`);
    }

    const normalizedBrand = normalizeBrand(brandInput);
    if (normalizedBrand) {
      values.push(normalizedBrand);
      conditions.push(`brand = $${values.length}`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const { rows } = await pool.query(query, values);

    return rows.map(mapProductRow);
  }

  async createProduct(productData: CreateProductDto) {
    const {
      articleId,
      name,
      category,
      price,
      discountType,
      discountValue,
      stock,
      imageUrl,
      imageUrls,
      brand,
      description,
      isHidden,
      size,
    } = productData;

    const normalizedImageUrls = normalizeImageUrls(imageUrls ?? imageUrl);
    const normalizedSize = normalizeSize(size);
    const piecesPerPack = normalizedSize.length;
    const normalizedDiscountType = normalizeDiscountType(discountType);
    const normalizedDiscountValue = normalizeDiscountValue(discountValue);

    validateDiscountConfig({
      price: roundPrice(Number(price) || 0),
      discountType: normalizedDiscountType,
      discountValue: normalizedDiscountValue,
    });

    const productId = uuidv4();

    const query = `
      INSERT INTO products (
        id,
        "articleId",
        name,
        category,
        price,
        "discountType",
        "discountValue",
        stock,
        "imageUrl",
        brand,
        description,
        "isHidden",
        "size",
        "piecesPerPack"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13::integer[], $14
      )
      RETURNING *
    `;

    const values = [
      productId,
      articleId?.trim() || null,
      name,
      category,
      price,
      normalizedDiscountType,
      normalizedDiscountValue,
      stock,
      normalizedImageUrls,
      brand,
      description || '',
      !!isHidden,
      normalizedSize,
      piecesPerPack,
    ];

    const { rows } = await pool.query(query, values);

    return mapProductRow(rows[0]);
  }

  async updateProduct(id: string, productData: UpdateProductDto) {
    const { rows: currentRows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id],
    );

    if (!currentRows.length) {
      throw new Error('Product not found');
    }

    const current = currentRows[0];

    const merged = {
      articleId:
        productData.articleId === undefined
          ? current.articleId
          : productData.articleId.trim() || null,
      name: productData.name ?? current.name,
      category: productData.category ?? current.category,
      price: productData.price ?? current.price,
      discountType:
        productData.discountType === undefined
          ? normalizeDiscountType(current.discountType)
          : normalizeDiscountType(productData.discountType),
      discountValue:
        productData.discountValue === undefined
          ? normalizeDiscountValue(current.discountValue)
          : normalizeDiscountValue(productData.discountValue),
      stock: productData.stock ?? current.stock,
      imageUrls: normalizeImageUrls(
        productData.imageUrls ?? productData.imageUrl ?? current.imageUrl,
      ),
      brand: productData.brand ?? current.brand,
      description: productData.description ?? current.description,
      isHidden:
        productData.isHidden === undefined
          ? current.isHidden
          : !!productData.isHidden,
      size: normalizeSize(productData.size ?? current.size),
    };

    if (!merged.discountType) {
      merged.discountValue = null;
    }

    validateDiscountConfig({
      price: roundPrice(Number(merged.price) || 0),
      discountType: merged.discountType,
      discountValue: merged.discountValue,
    });

    const piecesPerPack = merged.size.length;

    const query = `
      UPDATE products
      SET
        name = $1,
        "articleId" = $2,
        category = $3,
        price = $4,
        "discountType" = $5,
        "discountValue" = $6,
        stock = $7,
        "imageUrl" = $8,
        brand = $9,
        description = $10,
        "isHidden" = $11,
        "size" = $12::integer[],
        "piecesPerPack" = $13
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      merged.name,
      merged.articleId,
      merged.category,
      merged.price,
      merged.discountType,
      merged.discountValue,
      merged.stock,
      merged.imageUrls,
      merged.brand,
      merged.description,
      merged.isHidden,
      merged.size,
      piecesPerPack,
      id,
    ];

    const { rows } = await pool.query(query, values);

    return mapProductRow(rows[0]);
  }

  async updateVisibility(id: string, isHidden: boolean) {
    const query = `
      UPDATE products
      SET "isHidden" = $1
      WHERE id = $2
      RETURNING *
    `;

    const { rows } = await pool.query(query, [!!isHidden, id]);

    return rows[0];
  }

  async deleteProduct(id: string) {
    const { rows: productRows } = await pool.query(
      `SELECT "imageUrl" FROM products WHERE id = $1`,
      [id],
    );

    if (productRows.length > 0) {
      const product = productRows[0];

      const imageUrls = Array.isArray(product.imageUrl)
        ? product.imageUrl
        : product.imageUrl
          ? [product.imageUrl]
          : [];

      for (const url of imageUrls) {
        await this.uploadsService.deleteImageByUrl(url);
      }
    }

    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);

    return true;
  }
}
