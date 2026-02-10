const express = require("express");
const bodyParser = require("body-parser");
const rutasGen = require('./routes/general');

//const passport = require('passport');
//const session = require('express-session');
//const { init: initAuth } = require('./passp.js');
const cors = require("cors");

const app = express();
const PORT = 4000;

//const db = require("./models");
//db.sequelize.sync();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://192.168.96.131:5173", "http://192.168.96.131"],
    })
);

// parse requests de tipo de contenido - application/json
app.use(bodyParser.json());

// parse requests de tipo de contenido - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', rutasGen);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploaded', express.static(path.join(__dirname, './public/uploads')));

// Habilitado para acceso local 
// TIP: Usa esto para despliegue --> const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado con éxito bajo el puerto ${PORT}.`);
});