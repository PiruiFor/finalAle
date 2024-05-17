const express = require('express');
const router = express.Router();
const conexionDB = require('../db/db');

// Endpoint de inicio de sesión
router.post('/', (req, res) => {
    const { username, password } = req.body;

    // Consulta SQL correcta usando placeholders
    const sql = `SELECT * FROM usuarios WHERE username = ? AND contraseña = ?`;
    
    conexionDB.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        
        // Verificar si se encontró el usuario
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado o contraseña incorrecta' });
        }
        
        // Iniciar sesión exitoso
        console.log("Inicio de sesión correcto!");
        res.json({ message: "Inicio de sesión correcto" });
    });
});

module.exports = router;
