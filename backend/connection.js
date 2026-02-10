const { Pool } = require('pg');
const dbConfig = require("./config.js");

const pool = new Pool({
  user: dbConfig.USER,
  host: dbConfig.HOST,
  database: dbConfig.DB,
  password: dbConfig.PASSWORD,
  dialect: dbConfig.dialect,
  port: dbConfig.PORT
});

pool.on('connect', () => {
  //console.log('📦 ¡Conexión exitosa!');
});

module.exports = pool;