const conexionDB = require('../db/db')

const consultarUsuarios = async (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    conexionDB.query(sql, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en la consulta de la base de datos.');
        }
        res.json(results);
    });
}

const registrarUsuarios = async (req, res) => {
    const { username, password, confirmar, id_persona } = req.body;

    if (password !== confirmar) {
        return res.status(400).send('Las contraseñas no coinciden.');
    }

    // Verificar si el id_persona ya existe
    const checkSql = 'SELECT * FROM usuarios WHERE id_persona = ?';
    conexionDB.query(checkSql, [id_persona], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en la consulta de la base de datos.');
        }

        if (results.length > 0) {
            return res.status(400).send('El id_persona ya está en uso.');
        }

        // Insertar nuevo usuario si el id_persona no existe
        const insertSql = 'INSERT INTO usuarios (username, contraseña, id_persona) VALUES (?, ?, ?)';
        conexionDB.query(insertSql, [username, password, id_persona], (insertError, insertResults) => {
            if (insertError) {
                console.error('Error en la consulta:', insertError);
                return res.status(500).send('Error en la consulta de la base de datos.');
            }
            console.log("Usuario creado exitosamente!")
            res.send('Usuario cargado correctamente.');
        });
    });
}

const editarUsuarios = async (req, res) => {
    const id_usuario = req.params.id_usuario;
    const { username, password } = req.body;
    
    // Verificar si el ID del usuario a editar está presente
    if (!id_usuario) {
        return res.status(400).json({ message: "ID de usuario no proporcionado." });
    }

    // Construir la consulta SQL UPDATE
    const sql = `UPDATE usuarios SET username = ?, contraseña = ? WHERE id_usuario = ?`;

    // Ejecutar la consulta SQL
    conexionDB.query(sql, [username, password, id_usuario], (error, results) => {
        if (error) {
            console.error("Error al editar el usuario:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // Verificar si se realizó la actualización correctamente
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // El usuario se actualizó correctamente
        console.log('Usuario Editado correctamente')
        return res.status(200).json({ message: "Usuario actualizado correctamente." });
       
    });
};

const eliminarUsuarios = (req, res) => {
    const id_usuario = req.params.id_usuario; // Obtener el ID del usuario de los parámetros de la URL

    // Verificar si el ID del usuario a eliminar está presente
    if (!id_usuario) {
        return res.status(400).json({ message: "ID de usuario no proporcionado." });
    }

    // Construir la consulta SQL DELETE
    const sql = `DELETE FROM usuarios WHERE id_usuario = ?`;

    // Ejecutar la consulta SQL
    conexionDB.query(sql, [id_usuario], (error, results) => {
        if (error) {
            console.error("Error al eliminar el usuario:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // Verificar si se eliminó correctamente el usuario
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // El usuario se eliminó correctamente
        console.log('Usuario eliminado exitosamente');
        return res.status(200).json({ message: "Usuario eliminado correctamente." });
    });
};


module.exports = {consultarUsuarios, registrarUsuarios, editarUsuarios, eliminarUsuarios}