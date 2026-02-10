const dbConfig = require("../config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./User.js")(sequelize, Sequelize);
db.sede = require("./sede.js")(sequelize, Sequelize);
db.zona = require("./zona.js")(sequelize, Sequelize);
db.area = require("./area.js")(sequelize, Sequelize);
db.link = require("./link.js")(sequelize, Sequelize);
db.event = require("./event.js")(sequelize, Sequelize);
//db.associations = require("./relations.js")(sequelize, Sequelize);

//db.event.sync({alter: true});

db.sede.hasMany(db.zona, {foreignKey: 'sede_id'});
db.zona.belongsTo(db.sede, {foreignKey: 'sede_id'});
db.area.hasMany(db.zona, {foreignKey: 'area_id'});
db.zona.belongsTo(db.area, {foreignKey: 'area_id'});
db.area.belongsTo(db.sede, {foreignKey: 'sede_id'});

module.exports = db;