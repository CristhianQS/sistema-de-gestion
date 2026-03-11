const pool = require('../connection');

const NotificacionesModel = {
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT
        n.*,
        json_build_object(
          'name', a.name
        ) AS area,
        json_build_object(
          'alumno_nombre', s.alumno_nombre,
          'alumno_codigo', s.alumno_codigo,
          'status', s.status
        ) AS submission
      FROM notifications n
      LEFT JOIN areas a
        ON a.id = n.related_area_id
      LEFT JOIN area_submissions s
        ON s.id = n.related_submission_id
      WHERE n.user_email = $1
      ORDER BY n.created_at DESC`,
      [email]
    );

    return result.rows;
  },

  async findUnread(email) {
    const result = await pool.query(
      `SELECT
        n.*,
        json_build_object(
          'name', a.name
        ) AS area,
        json_build_object(
          'alumno_nombre', s.alumno_nombre,
          'alumno_codigo', s.alumno_codigo,
          'status', s.status
        ) AS submission
      FROM notifications n
      LEFT JOIN areas a
        ON a.id = n.related_area_id
      LEFT JOIN area_submissions s
        ON s.id = n.related_submission_id
      WHERE n.user_email = $1
        AND n.read = false
      ORDER BY n.created_at DESC`,
      [email]
    );

    return result.rows;
  },

  async countUnread(email) {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_email = $1
         AND read = false`,
      [email]
    );

    return Number(result.rows[0].count);
  },

  async markAsRead(id) {
    const result = await pool.query(
      `UPDATE notifications
       SET read = true,
           read_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },

  async markAllAsRead(email) {
    const result = await pool.query(
      `UPDATE notifications
       SET read = true,
           read_at = NOW()
       WHERE user_email = $1
         AND read = false
       RETURNING *`,
      [email]
    );

    return result.rows;
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO notifications (
        user_email,
        user_name,
        title,
        message,
        type,
        related_submission_id,
        related_area_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.user_email,
        data.user_name,
        data.title,
        data.message,
        data.type,
        data.related_submission_id,
        data.related_area_id
      ]
    );

    return result.rows[0];
  },
}

module.exports = NotificacionesModel;