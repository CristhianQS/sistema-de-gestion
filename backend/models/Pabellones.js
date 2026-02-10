const pool = require('../connection');

const PabellonesModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT * FROM pabellones 
      ORDER BY nombre ASC`);

    return result.rows;
  },
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM pabellones WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const insertResult = await pool.query(
      `
      INSERT INTO pabellones (nombre, descripcion, imagen_url, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [data.nombre, data.descripcion, data.imagen_url, data.created_at]
    );

    const target = insertResult.rows[0];

    const result = await pool.query(
      `SELECT * FROM pabellones WHERE id = $1`, [target.id]);

    return result.rows[0];
  },

  async update(id, data) {
    const updateResult = await pool.query(
      `UPDATE pabellones
      SET nombre = $1, 
          descripcion = $2,
          imagen_url = $3,
          created_at = $4
      WHERE id = $5
      RETURNING *
      `,
      [data.nombre, data.descripcion, data.imagen_url, data.created_at, id]
    );

    const target = updateResult.rows[0];

    const result = await pool.query(
      `SELECT * FROM pabellones WHERE id = $1`, [target.id]);

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(`DELETE FROM pabellones WHERE id = $1`, [id]);
  
    return result.rows[0];
  },
}

module.exports = PabellonesModel;
