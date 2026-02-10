const pool = require('../connection');

const DocentesModel = {
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM docentes WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll() {
    const result = await pool.query(
      'SELECT * FROM docentes ORDER BY apellidos ASC, nombres ASC');
    return result.rows;
  },

  async findAllMatching(searchTerm, page, pageSize) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    console.log(searchTerm)

    let query = `SELECT * FROM docentes`;

    // Búsqueda por término
    if (searchTerm && searchTerm.trim()) {
      query += `
        WHERE 
          nombres ILIKE $1 OR
          apellidos ILIKE $1 OR
          dni ILIKE $1 OR
          email ILIKE $1
      `;
    }

    query += `
      ORDER BY apellidos ASC, nombres ASC LIMIT $2 OFFSET $3
    `;

    let countQuery = `
      SELECT COUNT(*) FROM docentes
    `;

    // Búsqueda por término (misma condición)
    if (searchTerm && searchTerm.trim()) {
      countQuery += `
        WHERE 
          nombres ILIKE $1 OR
          apellidos ILIKE $1 OR
          dni ILIKE $1 OR
          email ILIKE $1
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

  async findByCredentials(email, password) {
    const result = await pool.query(
      'SELECT * FROM admin_user WHERE email = $1 AND password = $2 LIMIT 1',
      [email, password]
    );
    return result.rows[0] || null;
  },

  async find(data) {
    var addedquery = " WHERE";
    if (data.id) {
      addedquery = addedquery + " id = " + data.id;
    }
    if (data.dni) {
      addedquery = addedquery + ` dni = '` + data.dni + `'`;
    }
    if (data.estado) {
      addedquery = addedquery + ` estado = '` + data.estado + `'`;
    }
    const result = await pool.query(
      `SELECT * FROM docentes` + addedquery
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

  async findAllEx() {
    const result = await pool.query(
      'SELECT estado FROM docentes');
    return result.rows;
  },
};

module.exports = DocentesModel;