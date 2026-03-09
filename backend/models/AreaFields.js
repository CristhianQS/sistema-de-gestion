const pool = require('../config/db');

const AreaFieldsModel = {

  async getAreaFields(areaId) {
    const result = await pool.query(
      `SELECT *
       FROM area_fields
       WHERE area_id = $1
       ORDER BY order_index ASC`,
      [areaId]
    );

    return result.rows;
  },

  async createAreaField(fieldData) {
    const {
      area_id,
      field_name,
      field_type,
      required,
      order_index
    } = fieldData;

    const result = await pool.query(
      `INSERT INTO area_fields
       (area_id, field_name, field_type, required, order_index)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [area_id, field_name, field_type, required, order_index]
    );

    return result.rows[0];
  },

  async updateAreaField(id, fieldData) {
    const {
      field_name,
      field_type,
      required,
      order_index
    } = fieldData;

    const result = await pool.query(
      `UPDATE area_fields
       SET field_name = $1,
           field_type = $2,
           required = $3,
           order_index = $4
       WHERE id = $5
       RETURNING *`,
      [field_name, field_type, required, order_index, id]
    );

    return result.rows[0] || null;
  },

  async deleteAreaField(id) {
    await pool.query(
      `DELETE FROM area_fields
       WHERE id = $1`,
      [id]
    );

    return true;
  },

  async getSelectionOptions(areaId) {
    const result = await pool.query(
      `SELECT *
       FROM selection_options
       WHERE area_id = $1
       ORDER BY group_name ASC, order_index ASC`,
      [areaId]
    );

    return result.rows;
  },

  async createSelectionOption(optionData) {
    const {
      area_id,
      group_name,
      option_value,
      option_label,
      order_index
    } = optionData;

    const result = await pool.query(
      `INSERT INTO selection_options
       (area_id, group_name, option_value, option_label, order_index)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [area_id, group_name, option_value, option_label, order_index]
    );

    return result.rows[0];
  },

  async deleteSelectionOption(id) {
    await pool.query(
      `DELETE FROM selection_options
       WHERE id = $1`,
      [id]
    );

    return true;
  }

};

module.exports = AreaFieldsModel;