const pool = require('../../config/database.config');
const { v4: uuidv4 } = require('uuid');

exports.getAllProducts = async (includeHidden) => {
    let query = 'SELECT * FROM products';
    if (!includeHidden) {
        query += ' WHERE "isHidden" = false';
    }
    
    const { rows } = await pool.query(query);
    return rows;
};

exports.createProduct = async (productData) => {
    const { name, category, price, stock, imageUrl, brand, isHidden } = productData;
    const query = `
        INSERT INTO products (id, name, category, price, stock, "imageUrl", brand, "isHidden") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [uuidv4(), name, category, price, stock, imageUrl, brand, isHidden || false];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

exports.updateProduct = async (id, productData) => {
    const { name, category, price, stock, imageUrl, brand, isHidden } = productData;
    const query = `
        UPDATE products 
        SET name=$1, category=$2, price=$3, stock=$4, "imageUrl"=$5, brand=$6, "isHidden"=$7 
        WHERE id=$8 RETURNING *`;
    const values = [name, category, price, stock, imageUrl, brand, isHidden, id];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

exports.updateVisibility = async (id, isHidden) => {
    const query = `UPDATE products SET "isHidden" = $1 WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(query, [!!isHidden, id]);
    return rows[0];
};

exports.deleteProduct = async (id) => {
    const query = `DELETE FROM products WHERE id = $1`;
    await pool.query(query, [id]);
    return true;
};
