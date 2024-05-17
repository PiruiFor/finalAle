const conexionDB = require('../db/db')

const consultarPersonas = async (req, res) => {
    const sql = 'SELECT id_persona, nombre_completo FROM personas';
    conexionDB.query(sql, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en la consulta de la base de datos.');
        }
        res.json(results);
    });
}

module.exports = {consultarPersonas}