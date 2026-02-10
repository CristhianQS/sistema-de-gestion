const pool = require('../connection');

const SalonesModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT 
        s.*,
        json_build_object(
          'id', p.id,
          'nombre', p.nombre,
          'descripcion', p.descripcion
        ) AS pabellon
      FROM salones s
      JOIN pabellones p ON p.id = s.pabellon_id
      ORDER BY s.nombre ASC`);

    return result.rows;
  },

  async findAllEx(arg) {
    const result = await pool.query(
      `SELECT 
        s.*,
        json_build_object(
          'id', p.id,
          'nombre', p.nombre,
          'descripcion', p.descripcion
        ) AS pabellon
      FROM salones s
      JOIN pabellones p ON p.id = s.pabellon_id
      WHERE s.pabellon_id = $1
      ORDER BY s.nombre ASC`, [arg]);

    return result.rows;
  },

  async find(id) {
    const result = await pool.query(
      `SELECT 
        s.*,
        json_build_object(
          'id', p.id,
          'nombre', p.nombre,
          'descripcion', p.descripcion
        ) AS pabellon
      FROM salones s
      JOIN pabellones p ON p.id = s.pabellon_id
      WHERE s.id = $1
      ORDER BY s.nombre ASC`, [id]);

    return result.rows;
  },

  async create(data) {
    const insertResult = await pool.query(
      `INSERT INTO salones (nombre, capacidad, pabellon_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [data.nombre, data.capacidad, data.pabellon_id]
    );

    const salon = insertResult.rows[0];

    const result = await pool.query(
      `SELECT 
          $1::int AS id,
          json_build_object(
            'id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion
          ) AS pabellon
        FROM pabellones p
        WHERE p.id = $2`,
      [salon.id, salon.pabellon_id]
    );

    return result.rows[0];
  },

  async update(id, data) {
    const insertResult = await pool.query(
      `UPDATE salones 
        SET nombre = COALESCE($1, name), 
          capacidad = COALESCE($2, email),
          pabellon_id = COALESCE($3, area_id)
        WHERE id = $4
        RETURNING *`,
      [data.nombre, data.capacidad, data.pabellon_id, id]
    );

    const salon = insertResult.rows[0];

    const result = await pool.query(
      `SELECT 
          $1::int AS id,
          json_build_object(
            'id', p.id,
            'nombre', p.nombre,
            'descripcion', p.descripcion
          ) AS pabellon
        FROM pabellones p
        WHERE p.id = $2`,
      [salon.id, salon.pabellon_id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(`DELETE FROM salones WHERE id = $1`, [id]);
  
    return result.rows[0];
  },

  async countSalonesById(id) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM salones 
      WHERE pabellon_id = $1`, [id]);

    return result.rows;
  },
}

module.exports = SalonesModel;