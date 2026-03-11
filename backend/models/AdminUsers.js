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
  },

  async findAllWithAreas(role) {
  const values = [];
  let where = '';

  if (role) {
    values.push(role);
    where = `WHERE au.role = $1`;
  }

  const result = await pool.query(
    `
    SELECT
      au.id,
      au.email,
      au.name,
      au.dni,
      au.role,
      au.area_id,
      au.created_at,
      a_direct.id AS direct_area_id,
      a_direct.name AS direct_area_name,
      ua.area_id AS linked_area_id,
      a_linked.name AS linked_area_name
    FROM admin_user au
    LEFT JOIN areas a_direct
      ON a_direct.id = au.area_id
    LEFT JOIN user_areas ua
      ON ua.user_id = au.id
    LEFT JOIN areas a_linked
      ON a_linked.id = ua.area_id
    ${where}
    ORDER BY au.name ASC
    `,
    values
  );

  const usersMap = {};

  result.rows.forEach(row => {
    if (!usersMap[row.id]) {
      usersMap[row.id] = {
        id: row.id,
        email: row.email,
        name: row.name,
        dni: row.dni,
        role: row.role,
        created_at: row.created_at,
        areas: []
      };
    }

    if (
      (row.role === 'admin_plata' || row.role === 'admin_oro') &&
      row.direct_area_id &&
      !usersMap[row.id].areas.some(area => area.id === row.direct_area_id)
    ) {
      usersMap[row.id].areas.push({
        id: row.direct_area_id,
        name: row.direct_area_name
      });
    }

    if (
      row.linked_area_id &&
      !usersMap[row.id].areas.some(area => area.id === row.linked_area_id)
    ) {
      usersMap[row.id].areas.push({
        id: row.linked_area_id,
        name: row.linked_area_name
      });
    }
  });

  return Object.values(usersMap);
},

};

module.exports = AdminUsersModel;