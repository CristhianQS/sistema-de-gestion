const pool = require('../connection');

const AdminUsersModel = {

  async findAdminOroWithAreas() {
    const result = await pool.query(`
      SELECT 
        au.*,
        a.id AS area_id,
        a.name AS area_name
      FROM admin_user au
      LEFT JOIN user_areas ua ON ua.user_id = au.id
      LEFT JOIN areas a ON a.id = ua.area_id
      WHERE au.role = 'admin_oro'
      ORDER BY au.created_at DESC;
    `);

    // Group areas per admin
    const adminsMap = {};

    result.rows.forEach(row => {
      if (!adminsMap[row.id]) {
        adminsMap[row.id] = {
          id: row.id,
          name: row.name,
          role: row.role,
          created_at: row.created_at,
          areas: []
        };
      }

      if (row.area_id) {
        adminsMap[row.id].areas.push({
          id: row.area_id,
          name: row.area_name
        });
      }
    });

    return Object.values(adminsMap);
  },

  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (!fields.length) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const result = await pool.query(`
      UPDATE admin_user
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `, [...values, id]);

    return result.rows[0];
  },

  async updatePassword(id, password) {
    const result = await pool.query(
      `UPDATE admin_user
       SET password = $1
       WHERE id = $2
       RETURNING *;`,
      [password, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM admin_user
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    return result.rows[0];
  }

};

module.exports = AdminUsersModel;