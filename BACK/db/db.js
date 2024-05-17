const mysql = require('mysql');

const conexionDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_consultorio'
});

conexionDB.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    process.exit(1); // Salir si hay un error en la conexión
  }
  console.log('Conectado a la base de datos');
});

module.exports = conexionDB;
