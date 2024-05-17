const conexionDB = require('../db/db')

const consultarPacientes = async (req, res) => {
    try {
        // Consulta SQL para obtener los datos de los médicos y unir con las tablas de personas y datos personales
        const sql = `
        SELECT 
        pa.id_paciente, pa.informacion_medica, pa.id_persona,
        per.sexo,  per.fecha_nacimiento, 
        dp.correo, dp.telefonos,
        re.nombres, re.apellidos,
        mxp.id_medico
        FROM pacientes pa
        INNER JOIN registros re ON pa.id_persona = re.id_registro
        INNER JOIN personas per ON pa.id_persona = per.id_persona
        INNER JOIN datos_personales dp ON per.id_persona = dp.id_persona
        LEFT JOIN medicosxpacientes mxp ON pa.id_paciente = mxp.id_paciente;`
    ;

    
        // Ejecutar la consulta SQL
        conexionDB.query(sql, (error, results) => {
            if (error) {
                console.error('Error en la consulta:', error);
                return res.status(500).send('Error en la consulta de la base de datos.');
            }

            // Enviar los resultados al frontend
            res.json(results);
        });
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta de la base de datos.');
    }
};

const agregarPacientes = async (req, res) => {
    const {nombre, apellido, sexo, fecha_nacimiento, telefonos, correo, id_medico, informacion_medica} = req.body;

    // Iniciar una transacción para asegurar la integridad de los datos
    conexionDB.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).send('Error al iniciar la transacción.');
        }

        const sql_registro = `INSERT INTO registros (nombres, apellidos) VALUES (?, ?)`;
        conexionDB.query(sql_registro, [nombre, apellido], (error, resultsRegistro) => {
            if (error) {
                console.error('Error al insertar en la tabla registros:', error);
                return conexionDB.rollback(() => {
                    res.status(500).send('Error al insertar en la tabla registros.');
                });
            }

            const id_registro = resultsRegistro.insertId;
            const sql_persona = `INSERT INTO personas (sexo, fecha_nacimiento, id_registro) VALUES (?, ?, ?)`;
            conexionDB.query(sql_persona, [sexo, fecha_nacimiento, id_registro], (error, resultsPersona) => {
                if (error) {
                    console.error('Error al insertar en la tabla personas:', error);
                    return conexionDB.rollback(() => {
                        res.status(500).send('Error al insertar en la tabla personas.');
                    });
                }

                const id_persona = resultsPersona.insertId;

                const sql_datos_personales = "INSERT INTO datos_personales (telefonos, correo, id_persona) VALUES (?,?,?)";
                conexionDB.query(sql_datos_personales, [telefonos, correo, id_persona], (error, resultsDatosPersonales) => {
                    if (error) {
                        console.error('Error al insertar en la tabla datos_personales:', error);
                        return conexionDB.rollback(() => {
                            res.status(500).send('Error al insertar en la tabla datos_personales.');
                        });
                    }

                    const sql_paciente = "INSERT INTO pacientes (informacion_medica, id_persona) VALUES (?,?)";
                    conexionDB.query(sql_paciente, [informacion_medica, id_persona], (error, resultsPaciente) => {
                        if (error) {
                            console.error('Error al insertar en la tabla pacientes:', error);
                            return conexionDB.rollback(() => {
                                res.status(500).send('Error al insertar en la tabla pacientes.');
                            });
                        }
                        const id_paciente = resultsPaciente.insertId;
                        const sql_medicosxpacientes = "INSERT INTO medicosxpacientes (id_medico, id_paciente) VALUES (?,?)";
                        conexionDB.query(sql_medicosxpacientes, [id_medico, id_paciente], (error, resultsMedicosxPacientes) => {
                            if (error) {
                                console.error('Error al insertar en la tabla medicosxpacientes:', error);
                                return conexionDB.rollback(() => {
                                    res.status(500).send('Error al insertar en la tabla medicosxpacientes.');
                                });
                            }

                            // Confirmar la transacción
                            conexionDB.commit((err) => {
                                if (err) {
                                    console.error('Error al confirmar la transacción:', err);
                                    return conexionDB.rollback(() => {
                                        res.status(500).send('Error al confirmar la transacción.');
                                    });
                                }
                                
                                console.log('Transacción completada exitosamente');
                                console.log('Registro de paciente exitoso');
                                res.status(200).send('Registro de paciente exitoso!');
                            });
                        });
                    });
                });
            });
        });
    });
};

const editarPacientes = async (req, res) => {
    const {nombreEditar, apellidoEditar, telefonoEditar, correoEditar, id_medicoEditar, informacion_medicaEditar} = req.body;
    const id_paciente = req.params.id_paciente;

    if (!id_paciente) {
        return res.status(400).json({ message: "ID paciente no proporcionado." });
    }

    try {
        // Iniciar la transacción
        conexionDB.beginTransaction();

        // Obtener id_persona desde la tabla paciente
        const idPersonaResult = await ejecutarConsulta("SELECT id_persona FROM pacientes WHERE id_paciente = ?", [id_paciente]);
        const id_persona = idPersonaResult[0].id_persona;

        // Actualizar registros
        const sql_registro = "UPDATE registros SET nombres = ?, apellidos = ? WHERE id_registro = ?";
        await ejecutarConsulta(sql_registro, [nombreEditar, apellidoEditar, id_persona]);

        // Actualizar datos_personales
        const sql_datos_personales = "UPDATE datos_personales SET telefonos = ?, correo = ? WHERE id_persona = ?";
        await ejecutarConsulta(sql_datos_personales, [telefonoEditar, correoEditar, id_persona]);

        // Actualizar la tabla pacientes
        const sql_paciente = "UPDATE pacientes SET informacion_medica = ? WHERE id_paciente = ?";
        await ejecutarConsulta(sql_paciente, [informacion_medicaEditar, id_paciente]);

        // Actualizar la tabla especialidades
        const sql_medicosxpaciente = "UPDATE medicosxpacientes SET id_medico= ? WHERE id_paciente= ?";
        await ejecutarConsulta(sql_medicosxpaciente, [id_medicoEditar, id_paciente]);

        // Confirmar la transacción
        conexionDB.commit();

        console.log('Transacción completada exitosamente');
        console.log('Editar paciente exitoso');
        res.status(200).send('Editar paciente exitoso!');
    } catch (error) {
        console.error('Error al editar el paciente:', error);
        conexionDB.rollback();
        res.status(500).send('Error al editar paciente.');
    }
}

const ejecutarConsulta = async (sql, params) => {
    return new Promise((resolve, reject) => {
        conexionDB.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

const eliminarPaciente = async (req, res) => {
    const id_paciente = req.params.id_paciente;
    
    if (!id_paciente) {
        return res.status(400).json({ message: "ID paciente no proporcionado." });
    }

    const sql = `DELETE FROM pacientes WHERE id_paciente = ?`;
    conexionDB.query(sql, [id_paciente], (error, results) => {
        if (error) {
            console.error("Error al eliminar el paciente:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // Verificar si se eliminó correctamente el paciente
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "PACIENTE no encontrado." });
        }

        // El paciente se eliminó correctamente
        console.log('Paciente eliminado exitosamente');
        return res.status(200).json({ message: "Paciente eliminado correctamente." });
    });
  
}


module.exports = {consultarPacientes, agregarPacientes, editarPacientes, eliminarPaciente}
