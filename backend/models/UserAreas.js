const pool = require('../connection');

const UserAreasModel = {

  async deleteByUserId(userId) {
    await pool.query(
      `DELETE FROM user_areas WHERE user_id = $1`,
      [userId]
    );
  },

  async insertMany(userAreasData) {
    if (!userAreasData || !userAreasData.length) return [];

    const values = [];
    const placeholders = userAreasData
        .map((item, index) => {
        const baseIndex = index * 2;
        values.push(item.user_id, item.area_id);
        return `($${baseIndex + 1}, $${baseIndex + 2})`;
        })
        .join(', ');

    const result = await pool.query(`
        INSERT INTO user_areas (user_id, area_id)
        VALUES ${placeholders}
        RETURNING *;
    `, values);

    return result.rows;
  }

};

module.exports = UserAreasModel;