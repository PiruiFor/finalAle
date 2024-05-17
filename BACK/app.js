const express = require('express');
const cors = require('cors'); // Asegúrate de haber instalado el paquete cors
const bodyParser = require('body-parser'); // Asegúrate de haber instalado el paquete body-parser
const loginRoutes = require('./Router/loginUser');
const registerUser = require('./Router/registerUser')
const personasRouter = require('./Router/personasRouter')
const medicosRouter = require('./Router/medicosRouter')
const pacientesRouter = require('./Router/pacientesRouter')
const empleadosRouter = require('./Router/empleadosRouter')


const app = express();
const port = 3000;
const conexionDB = require('./db/db');

// Configura la conexión a la base de datos (asegúrate de reutilizar la misma conexión si es necesario)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Rutas
app.use('/login', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, loginRoutes);

app.use('/register', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, registerUser);

app.use('/personas', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, personasRouter);

app.use('/medicos', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, medicosRouter);

app.use('/pacientes', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, pacientesRouter);

app.use('/empleados', (req, res, next) => {
  req.conexionDB = conexionDB;
  next();
}, empleadosRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
