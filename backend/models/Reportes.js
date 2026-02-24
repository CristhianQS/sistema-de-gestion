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

  async create(data) {
    const {
        titulo,
        descripcion,
        area_id,
        alumno_id,
        estado = 'pending',
        prioridad = false,
        es_docente = false,
        generado_ia = false
    } = data;

    const result = await pool.query(`
        INSERT INTO area_submissions
        (titulo, descripcion, area_id, alumno_id, estado, prioridad, es_docente, generado_ia)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *;
    `, [titulo, descripcion, area_id, alumno_id, estado, prioridad, es_docente, generado_ia]);

    return result.rows[0];
  },

  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (!fields.length) return null;

    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(', ');

    const result = await pool.query(`
        UPDATE area_submissions
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `, [...values, id]);

    return result.rows[0];
  },

  async delete(id) {
    await pool.query(
        `DELETE FROM area_submissions WHERE id = $1`,
        [id]
    );
  },

  async findByStatus(status) {
    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        WHERE estado = $1
        ORDER BY created_at DESC;
    `, [status]);

    return result.rows;
  },

  async countByStatus() {
    const result = await pool.query(`
        SELECT 
        COUNT(*) FILTER (WHERE estado = 'pending') AS pending,
        COUNT(*) FILTER (WHERE estado = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE estado = 'completed') AS completed,
        COUNT(*) AS total
        FROM area_submissions;
    `);

    return result.rows[0];
  },

  async findRecent(days = 7) {
    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC;
    `);

    return result.rows;
  },

  async findAIGenerated() {
    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        WHERE generado_ia = true
        ORDER BY created_at DESC;
    `);

    return result.rows;
  },

  async markAsReviewed(submissionId, reviewedBy) {
    await pool.query(`
        UPDATE area_submissions
        SET 
        revisado = true,
        revisado_por = $1,
        revisado_en = NOW()
        WHERE id = $2
    `, [reviewedBy, submissionId]);
  },

  async findUnreviewed() {
    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        WHERE revisado = false OR revisado IS NULL
        ORDER BY created_at DESC;
    `);

    return result.rows;
  },

  async countUnreviewedByArea(areaId) {
    const result = await pool.query(`
        SELECT COUNT(*) AS count
        FROM area_submissions
        WHERE area_id = $1
        AND (revisado = false OR revisado IS NULL);
    `, [areaId]);

    return result.rows[0].count;
  },

  async findDocentes(from, to) {
    const offset = from;
    const limit = to - from + 1;

    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        WHERE es_docente = true
        ORDER BY prioridad DESC, created_at DESC
        LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return result.rows;
  },

  async findWithPriority(from, to) {
    const offset = from;
    const limit = to - from + 1;

    const result = await pool.query(`
        SELECT *
        FROM area_submissions
        ORDER BY prioridad DESC, created_at DESC
        LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return result.rows;
  },

  async createDocente(data) {
    const {
        titulo,
        descripcion,
        area_id,
        docente_id,
        docente_dni,
        docente_nombre
    } = data;

    const result = await pool.query(`
        INSERT INTO area_submissions
        (titulo, descripcion, area_id, es_docente, prioridad, docente_id, docente_dni, docente_nombre)
        VALUES ($1,$2,$3,true,true,$4,$5,$6)
        RETURNING *;
    `, [titulo, descripcion, area_id, docente_id, docente_dni, docente_nombre]);

    return result.rows[0];
  }
};

module.exports = ReportesModel;