const pool = require('../../config/database.config');
const { v4: uuidv4 } = require('uuid');
const uploadsService = require('../uploads/uploads.service');

const DEFAULT_SIZE = 'default';

const normalizeStock = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
};

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const normalizeVariantCandidate = (variant) => {
    if (!variant) return null;

    const size = String(variant.size ?? '').trim();
    if (!size) return null;

    const parsedPrice = Number(variant.price);
    return {
        size,
        stock: normalizeStock(variant.stock ?? variant.quantity),
        price: variant.price === undefined || variant.price === null || variant.price === '' || !Number.isFinite(parsedPrice) ? null : parsedPrice,
        sku: variant.sku ? String(variant.sku) : null
    };
};

const parseSizeStringCandidate = (sizeEntry) => {
    const raw = String(sizeEntry ?? '').trim();
    if (!raw) return null;

    const [sizePart, stockPart] = raw.split(':');
    if (stockPart === undefined) {
        return { size: raw, stock: 0 };
    }

    return {
        size: String(sizePart || '').trim(),
        stock: normalizeStock(stockPart)
    };
};

const extractVariantCandidates = (productData) => {
    const candidates = [];
    let hasVariantInput = false;

    if (Array.isArray(productData.variants)) {
        hasVariantInput = true;
        candidates.push(...productData.variants);
    }

    if (Array.isArray(productData.sizes)) {
        hasVariantInput = true;
        for (const sizeEntry of productData.sizes) {
            if (isPlainObject(sizeEntry)) {
                candidates.push({
                    size: sizeEntry.size ?? sizeEntry.label ?? sizeEntry.value,
                    stock: sizeEntry.stock ?? sizeEntry.quantity,
                    price: sizeEntry.price,
                    sku: sizeEntry.sku
                });
            } else {
                candidates.push(parseSizeStringCandidate(sizeEntry));
            }
        }
    }

    if (Array.isArray(productData.sizeList)) {
        hasVariantInput = true;
        for (const sizeEntry of productData.sizeList) {
            if (isPlainObject(sizeEntry)) {
                candidates.push({
                    size: sizeEntry.size ?? sizeEntry.label ?? sizeEntry.value,
                    stock: sizeEntry.stock ?? sizeEntry.quantity,
                    price: sizeEntry.price,
                    sku: sizeEntry.sku
                });
            } else {
                candidates.push(parseSizeStringCandidate(sizeEntry));
            }
        }
    }

    if (isPlainObject(productData.sizeQuantities)) {
        hasVariantInput = true;
        for (const [size, quantity] of Object.entries(productData.sizeQuantities)) {
            candidates.push({ size, stock: quantity });
        }
    }

    if (isPlainObject(productData.sizeStockMap)) {
        hasVariantInput = true;
        for (const [size, quantity] of Object.entries(productData.sizeStockMap)) {
            candidates.push({ size, stock: quantity });
        }
    }

    return { candidates, hasVariantInput };
};

const normalizeVariants = (variants, fallbackStock = 0) => {
    if (!Array.isArray(variants) || !variants.length) {
        return [{ size: DEFAULT_SIZE, stock: normalizeStock(fallbackStock), price: null, sku: null }];
    }

    const dedupedBySize = new Map();
    for (const variant of variants) {
        const normalizedVariant = normalizeVariantCandidate(variant);
        if (!normalizedVariant) continue;
        dedupedBySize.set(normalizedVariant.size, normalizedVariant);
    }

    if (!dedupedBySize.size) {
        return [{ size: DEFAULT_SIZE, stock: normalizeStock(fallbackStock), price: null, sku: null }];
    }

    return Array.from(dedupedBySize.values());
};

const normalizeImageUrls = (imageValue) => {
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

const upsertVariants = async (client, productId, variants) => {
    for (const variant of variants) {
        await client.query(
            `
            INSERT INTO product_variants (id, product_id, size, stock, price, sku)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (product_id, size)
            DO UPDATE SET stock = EXCLUDED.stock, price = EXCLUDED.price, sku = EXCLUDED.sku
            `,
            [uuidv4(), productId, variant.size, variant.stock, variant.price, variant.sku]
        );
    }
};

const syncProductStock = async (client, productId) => {
    await client.query(
        `
        UPDATE products
        SET stock = COALESCE((
            SELECT SUM(v.stock)
            FROM product_variants v
            WHERE v.product_id = $1
        ), 0)
        WHERE id = $1
        `,
        [productId]
    );
};

const getVariantsByProductIds = async (client, productIds) => {
    if (!productIds.length) return new Map();
    const { rows } = await client.query(
        `
        SELECT id, product_id, size, stock, price, sku
        FROM product_variants
        WHERE product_id = ANY($1::uuid[])
        ORDER BY size ASC
        `,
        [productIds]
    );

    const variantsByProductId = new Map();
    for (const row of rows) {
        const mapped = {
            id: row.id,
            productId: row.product_id,
            size: row.size,
            stock: Number(row.stock || 0),
            price: row.price === null ? null : Number(row.price),
            sku: row.sku
        };

        if (!variantsByProductId.has(row.product_id)) {
            variantsByProductId.set(row.product_id, []);
        }
        variantsByProductId.get(row.product_id).push(mapped);
    }

    return variantsByProductId;
};

const withVariants = (productRow, variantsByProductId) => {
    const variants = variantsByProductId.get(productRow.id) || [];
    const computedStock = variants.length
        ? variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
        : Number(productRow.stock || 0);

    const imageUrls = Array.isArray(productRow.imageUrl)
        ? productRow.imageUrl
        : productRow.imageUrl
            ? [productRow.imageUrl]
            : [];

    return {
        ...productRow,
        stock: computedStock,
        variants,
        sizes: variants.map((variant) => variant.size),
        imageUrls,
        imageUrl: imageUrls[0] || null
    };
};

exports.getAllProducts = async (includeHidden) => {
    let query = 'SELECT * FROM products';
    if (!includeHidden) {
        query += ' WHERE "isHidden" = false';
    }

    const { rows } = await pool.query(query);
    const productIds = rows.map((product) => product.id);
    const variantsByProductId = await getVariantsByProductIds(pool, productIds);
    return rows.map((product) => withVariants(product, variantsByProductId));
};

exports.createProduct = async (productData) => {
    const {
        name,
        category,
        price,
        stock,
        imageUrl,
        imageUrls,
        brand,
        description,
        isHidden,
        variants
    } = productData;
    const { candidates: variantCandidates, hasVariantInput } = extractVariantCandidates(productData);
    const normalizedImageUrls = normalizeImageUrls(imageUrls ?? imageUrl);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const productId = uuidv4();
        const { rows } = await client.query(
            `
            INSERT INTO products (id, name, category, price, stock, "imageUrl", brand, description, "isHidden")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            `,
            [
                productId,
                name,
                category,
                price,
                0,
                normalizedImageUrls,
                brand,
                description || '',
                !!isHidden
            ]
        );

        const normalizedVariants = hasVariantInput
            ? normalizeVariants(variantCandidates, stock)
            : normalizeVariants(variants, stock);
        await upsertVariants(client, productId, normalizedVariants);
        await syncProductStock(client, productId);

        const variantsByProductId = await getVariantsByProductIds(client, [productId]);
        const { rows: latestRows } = await client.query('SELECT * FROM products WHERE id = $1', [productId]);

        await client.query('COMMIT');
        return withVariants(latestRows[0], variantsByProductId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.updateProduct = async (id, productData) => {
    const client = await pool.connect();
    const { candidates: variantCandidates, hasVariantInput } = extractVariantCandidates(productData);
    try {
        await client.query('BEGIN');

        const { rows: currentRows } = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
        if (!currentRows.length) {
            throw new Error('Product not found');
        }

        const current = currentRows[0];
        const merged = {
            name: productData.name ?? current.name,
            category: productData.category ?? current.category,
            price: productData.price ?? current.price,
            imageUrls: normalizeImageUrls(productData.imageUrls ?? productData.imageUrl ?? current.imageUrl),
            brand: productData.brand ?? current.brand,
            description: productData.description ?? current.description ?? '',
            isHidden: productData.isHidden === undefined ? current.isHidden : !!productData.isHidden
        };

        await client.query(
            `
            UPDATE products
            SET
                name = $1,
                category = $2,
                price = $3,
                "imageUrl" = $4,
                brand = $5,
                description = $6,
                "isHidden" = $7
            WHERE id = $8
            `,
            [
                merged.name,
                merged.category,
                merged.price,
                merged.imageUrls,
                merged.brand,
                merged.description,
                merged.isHidden,
                id
            ]
        );

        if (hasVariantInput) {
            await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
            const normalizedVariants = normalizeVariants(variantCandidates, productData.stock ?? current.stock);
            await upsertVariants(client, id, normalizedVariants);
        } else if (productData.stock !== undefined) {
            const targetStock = normalizeStock(productData.stock);
            const { rows: existingVariants } = await client.query(
                `
                SELECT id, stock
                FROM product_variants
                WHERE product_id = $1
                ORDER BY "createdAt" ASC, id ASC
                FOR UPDATE
                `,
                [id]
            );

            if (!existingVariants.length) {
                await upsertVariants(client, id, [{ size: DEFAULT_SIZE, stock: targetStock, price: null, sku: null }]);
            } else if (existingVariants.length === 1) {
                await client.query(
                    `UPDATE product_variants SET stock = $1 WHERE id = $2`,
                    [targetStock, existingVariants[0].id]
                );
            } else {
                const totalStock = existingVariants.reduce((sum, item) => sum + Number(item.stock || 0), 0);
                const delta = targetStock - totalStock;
                const firstVariant = existingVariants[0];
                const adjustedFirstStock = Number(firstVariant.stock || 0) + delta;

                if (adjustedFirstStock < 0) {
                    throw new Error('Requested stock is lower than distributed variant stock');
                }

                await client.query(
                    `UPDATE product_variants SET stock = $1 WHERE id = $2`,
                    [adjustedFirstStock, firstVariant.id]
                );
            }
        }

        await syncProductStock(client, id);

        const { rows: updatedRows } = await client.query(`SELECT * FROM products WHERE id = $1`, [id]);
        const variantsByProductId = await getVariantsByProductIds(client, [id]);

        await client.query('COMMIT');
        return withVariants(updatedRows[0], variantsByProductId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.updateVisibility = async (id, isHidden) => {
    const query = `UPDATE products SET "isHidden" = $1 WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(query, [!!isHidden, id]);
    return rows[0];
};

exports.deleteProduct = async (id) => {
    const { rows: productRows } = await pool.query(`SELECT "imageUrl" FROM products WHERE id = $1`, [id]);
    
    if (productRows.length > 0) {
        const product = productRows[0];
        const imageUrls = Array.isArray(product.imageUrl)
            ? product.imageUrl
            : product.imageUrl
                ? [product.imageUrl]
                : [];

        for (const url of imageUrls) {
            await uploadsService.deleteImageByUrl(url);
        }
    }

    const query = `DELETE FROM products WHERE id = $1`; //
    await pool.query(query, [id]); //
    return true; //
};
