const pool = require('../connection');

const AlumnosModel = {
  async findAllEx(offset, limit) {
    const result = await pool.query(
    `
    SELECT *
    FROM data_alumnos
    ORDER BY estudiante ASC
    OFFSET $1
    LIMIT $2
    `,
    [offset, limit]
  );

    return result.rows;
  },

  async countAll() {
    const result = await pool.query(
        'SELECT COUNT(*) FROM data_alumnos'
    );

    return result.rows[0].count;
  },

  async findAll() {
    const result = await pool.query(
    `SELECT *
    FROM data_alumnos
    ORDER BY estudiante ASC`);

    return result.rows;
  },
};

module.exports = AlumnosModel;