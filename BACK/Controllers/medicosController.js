const conexionDB = require('../db/db')

const consultarMedicos = async (req, res) => {
    try {
        // Consulta SQL para obtener los datos de los médicos y unir con las tablas de personas y datos personales
        const sql = `
        SELECT m.*, p.sexo, p.fecha_nacimiento, dp.telefonos, dp.correo, me.id_especialidad, esp.nombre AS especialidad, re.nombres, re.apellidos
        FROM medicos m
        INNER JOIN personas p ON m.id_persona = p.id_persona
        INNER JOIN registros re ON m.id_persona = re.id_registro
        INNER JOIN datos_personales dp ON m.id_persona = dp.id_persona
        INNER JOIN medicosxespecialidades me ON m.id_medico = me.id_medico
        INNER JOIN especialidades esp ON me.id_especialidad = esp.id_especialidad
    `;
    
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

const agregarMedicos = async (req, res) => {
    const {nombre, apellido, sexo, fecha_nacimiento, telefonos, correo, tipo_medico, especialidad} = req.body;

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

                    const sql_medico = "INSERT INTO medicos (tipo_medico, id_persona) VALUES (?,?)";
                    conexionDB.query(sql_medico, [tipo_medico, id_persona], (error, resultsMedico) => {
                        if (error) {
                            console.error('Error al insertar en la tabla medicos:', error);
                            return conexionDB.rollback(() => {
                                res.status(500).send('Error al insertar en la tabla medicos.');
                            });
                        }
                        const id_medico = resultsMedico.insertId;
                        const sql_medicosxespecialidades = "INSERT INTO medicosxespecialidades (id_medico, id_especialidad) VALUES (?,?)";
                        conexionDB.query(sql_medicosxespecialidades, [id_medico, especialidad], (error, resultsMedicosxEspecialidades) => {
                            if (error) {
                                console.error('Error al insertar en la tabla medicosxespecialidades:', error);
                                return conexionDB.rollback(() => {
                                    res.status(500).send('Error al insertar en la tabla medicosxespecialidades.');
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
                                console.log('Registro de médico exitoso');
                                res.status(200).send('Registro de médico exitoso!');
                            });
                        });
                    });
                });
            });
        });
    });
};

const editarMedicos = async (req, res) => {
    const {nombreEditar, apellidoEditar, telefonoEditar, correoEditar, tipo_medicoEditar, id_especialidad } = req.body;
    const id_medico = req.params.id_medico;

    if (!id_medico) {
        return res.status(400).json({ message: "ID medico no proporcionado." });
    }

    try {
        // Iniciar la transacción
        conexionDB.beginTransaction();

        // Obtener id_persona desde la tabla medico
        const idPersonaResult = await ejecutarConsulta("SELECT id_persona FROM medicos WHERE id_medico = ?", [id_medico]);
        const id_persona = idPersonaResult[0].id_persona;

        // Actualizar registros
        const sql_registro = "UPDATE registros SET nombres = ?, apellidos = ? WHERE id_registro = ?";
        await ejecutarConsulta(sql_registro, [nombreEditar, apellidoEditar, id_persona]);

        // Actualizar datos_personales
        const sql_datos_personales = "UPDATE datos_personales SET telefonos = ?, correo = ? WHERE id_persona = ?";
        await ejecutarConsulta(sql_datos_personales, [telefonoEditar, correoEditar, id_persona]);

        // Actualizar la tabla medicos
        const sql_medico = "UPDATE medicos SET tipo_medico = ? WHERE id_medico = ?";
        await ejecutarConsulta(sql_medico, [tipo_medicoEditar, id_medico]);

        // Actualizar la tabla especialidades
        const sql_especialidad = "UPDATE medicosxespecialidades SET id_especialidad= ? WHERE id_medico= ?";
        await ejecutarConsulta(sql_especialidad, [id_especialidad, id_medico]);

        // Confirmar la transacción
        conexionDB.commit();

        console.log('Transacción completada exitosamente');
        console.log('Editar médico exitoso');
        res.status(200).send('Editar médico exitoso!');
    } catch (error) {
        console.error('Error al editar médico:', error);
        conexionDB.rollback();
        res.status(500).send('Error al editar médico.');
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


const eliminarMedicos = async (req, res) => {
    const id_medico = req.params.id_medico;
    
    if (!id_medico) {
        return res.status(400).json({ message: "ID medico no proporcionado." });
    }

    const sql = `DELETE FROM medicos WHERE id_medico = ?`;
    conexionDB.query(sql, [id_medico], (error, results) => {
        if (error) {
            console.error("Error al eliminar el médico:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // Verificar si se eliminó correctamente el médico
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Médico no encontrado." });
        }

        // El usuario se eliminó correctamente
        console.log('Médico eliminado exitosamente');
        return res.status(200).json({ message: "Médico eliminado correctamente." });
    });
  
}

module.exports = {consultarMedicos, agregarMedicos, editarMedicos, eliminarMedicos}