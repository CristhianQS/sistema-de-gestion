const pool = require('../connection');

const ReportesModel = {
  async countAll() {
    const result = await pool.query(
      'SELECT COUNT(*) AS count FROM area_submissions'
    );

    return result.rows[0].count;
  },

  async findAllEx(from, to) {
    const query = `
      SELECT 
      area_submissions.*, 
      areas.id AS area_id,
      areas.name AS area_name,
      areas.description AS area_description,
      data_alumnos.id AS alumno_id,
      data_alumnos.codigo AS alumno_codigo,
      data_alumnos.estudiante AS alumno_estudiante
      FROM area_submissions
      LEFT JOIN areas ON area_submissions.area_id = areas.id
      LEFT JOIN data_alumnos ON area_submissions.alumno_id = data_alumnos.id
      ORDER BY area_submissions.prioridad DESC, area_submissions.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const offset = from;

    const result = await pool.query(query, [to - from + 1, offset]);

    return result.rows;
  },

  async findAll() {
    const result = await pool.query(`
      SELECT 
        area_submissions.*, 
        areas.id AS area_id,
        areas.name AS area_name,
        areas.description AS area_description,
        data_alumnos.id AS alumno_id,
        data_alumnos.codigo AS alumno_codigo,
        data_alumnos.estudiante AS alumno_estudiante
      FROM area_submissions
      LEFT JOIN areas ON area_submissions.area_id = areas.id
      LEFT JOIN data_alumnos ON area_submissions.alumno_id = data_alumnos.id
      ORDER BY area_submissions.created_at DESC;
    `);

    return result.rows;
  },

  async find(id) {
    const result = await pool.query(`
      SELECT 
        area_submissions.*, 
        areas.id AS area_id,
        areas.name AS area_name,
        areas.description AS area_description,
        data_alumnos.id AS alumno_id,
        data_alumnos.codigo AS alumno_codigo,
        data_alumnos.estudiante AS alumno_estudiante
      FROM area_submissions
      LEFT JOIN areas ON area_submissions.area_id = areas.id
      LEFT JOIN data_alumnos ON area_submissions.alumno_id = data_alumnos.id
      WHERE area_submissions.id = $1
      LIMIT 1`, [id]);

    return result.rows[0];
  },

  async countOne(id) {
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM area_submissions
      WHERE area_submissions.area_id = $1`, [id]);

    return result.rows[0].count
  },

  async findEx(id, from, to) {
    const offset = from;
    const limit = to - from + 1;

    const result = await pool.query(`
      SELECT 
        area_submissions.*, 
        areas.id AS area_id,
        areas.name AS area_name,
        areas.description AS area_description,
        data_alumnos.id AS alumno_id,
        data_alumnos.codigo AS alumno_codigo,
        data_alumnos.estudiante AS alumno_estudiante
      FROM area_submissions
      LEFT JOIN areas ON area_submissions.area_id = areas.id
      LEFT JOIN data_alumnos ON area_submissions.alumno_id = data_alumnos.id
      WHERE area_submissions.area_id = $1
      ORDER BY area_submissions.created_at DESC
      LIMIT $2 OFFSET $3;
    `, [id, limit, offset]);

    return result.rows;
  },

  async countEx2(id) {
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM area_submissions
      WHERE area_submissions.codigo_alumno = $1`, [id]);

    return result.rows[0].count
  },

  async findEx2(id, from, to) {
    const offset = from;
    const limit = to - from + 1;

    const result = await pool.query(`
      SELECT 
        area_submissions.*, 
        areas.id AS area_id,
        areas.name AS area_name,
        areas.description AS area_description,
        data_alumnos.id AS alumno_id,
        data_alumnos.codigo AS alumno_codigo,
        data_alumnos.estudiante AS alumno_estudiante
      FROM area_submissions
      LEFT JOIN areas ON area_submissions.area_id = areas.id
      LEFT JOIN data_alumnos ON area_submissions.alumno_id = data_alumnos.id
      WHERE area_submissions.codigo_alumno = $1
      ORDER BY area_submissions.created_at DESC
      LIMIT $2 OFFSET $3;
    `, [id, limit, offset]);

    return result.rows;
  },
};

module.exports = ReportesModel;