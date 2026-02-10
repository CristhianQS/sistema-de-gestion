const pool = require('../connection');

const AreaModel = {
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name FROM areas WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  },

  async findAll() {
    const result = await pool.query(
      'SELECT id, name FROM areas ORDER BY name');
    return result.rows;
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO areas (name, description, image_url) VALUES ($1, $2, $3) RETURNING *`,
      [area.name, area.description, area.image_url]);

    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
        `UPDATE areas SET name = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *`, 
        [data.name, data.description, data.image_url, id]);

    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM areas WHERE id = $1`, [id]);

    return result.rows[0];
  },
  
  async search({ keyword, limit, offset }) {
    const search = `%${keyword}%`;

    // Query de conteo
    const countResult = await pool.query(
      `SELECT COUNT(*) 
       FROM areas
       WHERE name ILIKE $1 OR description ILIKE $1`,
      [search]
    );

    const count = Number(countResult.rows[0].count);

    // Datos de la búsqueda
    const dataResult = await pool.query(
      `SELECT *
       FROM areas
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY name ASC
       LIMIT $2 OFFSET $3`,
      [search, limit, offset]
    );

    return {count, data: dataResult.rows};
  },
};

module.exports = AreaModel;