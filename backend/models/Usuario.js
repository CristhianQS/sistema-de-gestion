const pool = require('../connection');

const UsuarioModel = {
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM areas WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll() {
    const result = await pool.query(
      `SELECT au.*,
        json_build_object(
          'id', a.id,
          'name', a.name,
          'description', a.description
        ) AS area
      FROM admin_user au
      LEFT JOIN areas a ON a.id = au.area_id
      ORDER BY au.name ASC`
    );
    return result.rows;
  },

  async findByCredentials(email, password) {
    const result = await pool.query(
      'SELECT * FROM admin_user WHERE email = $1 AND password = $2 LIMIT 1',
      [email, password]
    );
    return result.rows[0] || null;
  },

  async find(data) {
    var addedquery = " WHERE";
    if (data.id != 0) {
      addedquery = addedquery + " au.id = " + data.id;
    }
    if (data.email != "") {
      addedquery = addedquery + ` au.email = '` + data.email + `'`;
    }
    if (data.role != '') {
      addedquery = addedquery + ` au.role = '` + data.role + `'`;
    }
    if (data.area_id != -1) {
      addedquery = addedquery + ' au.area_id = ' + data.area_id;
    } else {console.log("Yep, you're a negative 1")}
    const result = await pool.query(
      `SELECT au.*,
        json_build_object(
          'id', a.id,
          'name', a.name,
          'description', a.description
        ) AS area 
      FROM admin_user au LEFT JOIN areas a ON a.id = au.area_id` + addedquery
    );
    
    return result.rows[0] || null;
  },

  async create(data) {
    const insertResult = await pool.query(
      `
      INSERT INTO admin_user (name, email, dni, password, area_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [data.name, data.email, data.dni, data.password, data.area_id]
    );

    const user = insertResult.rows[0];

    const result = await pool.query(
      `
      SELECT
        au.*,
        json_build_object(
          'id', a.id,
          'name', a.name,
          'description', a.description
        ) AS area
      FROM admin_user au
      LEFT JOIN areas a ON a.id = au.area_id
      WHERE au.id = $1
      `,
      [user.id]
    );

    return result.rows[0];
  },

  async update(id, updates) {
    const updateResult = await pool.query(
      `UPDATE admin_user
      SET name = COALESCE($1, name), 
          email = COALESCE($2, email),
          area_id = COALESCE($3, area_id)
      WHERE id = $4
      RETURNING id, name, email, area_id`,
      [updates.name, updates.email, updates.area_id, id]
    );

    const user = updateResult.rows[0];

    const result = await pool.query(
      `SELECT
        au.*,
        json_build_object(
          'id', a.id,
          'name', a.name,
          'description', a.description
        ) AS area
      FROM admin_user au LEFT JOIN areas a ON a.id = au.area_id WHERE au.id = $1`,
      [user.id]
    );

    return result.rows[0];
  },

  async delete(id) {
      const result = await pool.query(
        `DELETE FROM admin_user WHERE id = $1`, [id]);
  
      return result.rows[0];
    },

  async findByAreaId(id) {
    const result = await pool.query(
      'SELECT id FROM admin_user WHERE area_id = $1 LIMIT 1',
      [id]
    );
    return result.rows;
  },
};

module.exports = UsuarioModel;