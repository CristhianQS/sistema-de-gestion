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

  async findEx(data) {
    var str1 = ` WHERE`
    if (data.id) {
      str1 = str1 + ` id = '` + data.id + `'`;
    }
    if (data.codigo) {
      str1 = str1 + ` codigo = '` + data.codigo + `'`;
    }
    const result = await pool.query(
    `SELECT * FROM data_alumnos` + str1);

    return result.rows[0];
  },

  async create(data) {
    const insertResult = await pool.query(
      `INSERT INTO data_alumnos (dni, codigo, estudiante, carrera_profesional, facultad, modalidad, 
      ciclo, grupo, celular, religion, fecha_nacimiento, correo, pais)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [data.dni, data.codigo, data.estudiante, data.carrera_profesional, data.facultad, data.modalidad, 
      data.ciclo, data.grupo, data.celular, data.religion, data.fecha_nacimiento, data.correo, data.pais]
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
};

module.exports = AlumnosModel;