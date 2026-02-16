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

    const alumno = insertResult.rows[0];

    const result = await pool.query(
      `SELECT *
      FROM data_alumnos
      WHERE id = $1`,
      [alumno.id]
    );

    return result.rows[0];
  },

  async update(id, data) {
    const insertResult = await pool.query(
      `UPDATE data_alumnos 
        SET dni = $1, 
        codigo = $2, 
        estudiante = $3, 
        carrera_profesional = $4, 
        facultad = $5, 
        modalidad = $6, 
        ciclo = $7, 
        grupo = $8, 
        celular = $9, 
        religion = $10, 
        fecha_nacimiento = $11, 
        correo = $12, 
        pais = $13
        WHERE id = $14
        RETURNING *`,
      [data.dni, data.codigo, data.estudiante, data.carrera_profesional, data.facultad, data.modalidad, 
      data.ciclo, data.grupo, data.celular, data.religion, data.fecha_nacimiento, data.correo, data.pais, id]
    );

    const alumno = insertResult.rows[0];

    const result = await pool.query(
      `SELECT *
      FROM data_alumnos
      WHERE id = $1`,
      [alumno.id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(`DELETE FROM data_alumnos WHERE id = $1`, [id]);
  
    return result.rows[0];
  },
  
  async findAllMatching(searchTerm, page, pageSize) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    console.log(searchTerm)

    let query = `SELECT * FROM data_alumnos`;

    // Búsqueda por término
    if (searchTerm && searchTerm.trim()) {
      query += `
        WHERE 
          estudiante ILIKE $1 OR
          codigo ILIKE $1 
      `;
    }

    query += `
      ORDER BY apellidos ASC, nombres ASC LIMIT $2 OFFSET $3
    `;

    let countQuery = `
      SELECT COUNT(*) FROM data_alumnos
    `;

    // Búsqueda por término (misma condición)
    if (searchTerm && searchTerm.trim()) {
      countQuery += `
        WHERE 
          estudiante ILIKE $1 OR
          codigo ILIKE $1
      `;
    }

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [searchTerm ? `'%${searchTerm}%'` : null, pageSize, from]),
      pool.query(countQuery, [searchTerm ? `'%${searchTerm}%'` : null])
    ]);

    return {
      data: dataResult.rows,
      count: parseInt(countResult.rows[0].count, 10)
    };
  },
};

module.exports = AlumnosModel;