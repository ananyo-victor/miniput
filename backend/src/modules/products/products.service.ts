import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

const getSizeRange = (size: any): string | null => {
  const normalizedSize = normalizeSize(size);

  if (!normalizedSize.length) {
    return null;
  }

  return `${normalizedSize[0]}-${normalizedSize[normalizedSize.length - 1]}`;
};

const mapProductRow = (product: any) => {
  const normalizedSize = normalizeSize(product?.size);

  return {
    ...product,
    size: normalizedSize,
    imageUrls: product?.imageUrl || [],
    imageUrl: product?.imageUrl?.[0] || null,
    piecesPerPack: normalizedSize.length || product?.piecesPerPack,
    sizeRange: getSizeRange(normalizedSize),
  };
};

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly uploadsService: UploadsService) {}

  async onModuleInit() {
    await this.ensureSizeColumnIsIntegerArray();
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

  async getAllProducts(includeHidden: boolean) {
    let query = 'SELECT * FROM products';

    if (!includeHidden) {
      query += ' WHERE "isHidden" = false';
    }

    const { rows } = await pool.query(query);

    return rows.map(mapProductRow);
  }

  async createProduct(productData: CreateProductDto) {
    const {
      articleId,
      name,
      category,
      price,
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

    const productId = uuidv4();

    const query = `
      INSERT INTO products (
        id,
        "articleId",
        name,
        category,
        price,
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
        $7, $8, $9, $10, $11::integer[], $12
      )
      RETURNING *
    `;

    const values = [
      productId,
      articleId?.trim() || null,
      name,
      category,
      price,
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
    const piecesPerPack = merged.size.length;

    const query = `
      UPDATE products
      SET
        name = $1,
        "articleId" = $2,
        category = $3,
        price = $4,
        stock = $5,
        "imageUrl" = $6,
        brand = $7,
        description = $8,
        "isHidden" = $9,
        "size" = $10::integer[],
        "piecesPerPack" = $11
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      merged.name,
      merged.articleId,
      merged.category,
      merged.price,
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
