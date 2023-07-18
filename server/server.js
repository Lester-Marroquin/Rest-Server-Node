require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Base de datos Connected!'))
  .catch( error => console.log('Error al conectarse', error));

app.listen(process.env.PORT, ()=>{
  console.log(`Escuchando en el puerto: `, process.env.PORT);
});