const conexionDB = require('../db/db')

const consultarEmpleados = async (req, res) => {
    try {
        // Consulta SQL para obtener los datos de los médicos y unir con las tablas de personas y datos personales
    const sql = `
    SELECT 
    emp.id_empleado, emp.id_persona, emp.id_puesto,
    per.sexo, per.fecha_nacimiento,
    dp.correo, dp.telefonos,
    pt.nombre_puesto,
    re.nombres, re.apellidos
    FROM empleados emp
    INNER JOIN registros re ON emp.id_persona = re.id_registro
    INNER JOIN personas per ON emp.id_persona = per.id_persona
    INNER JOIN datos_personales dp ON per.id_persona = dp.id_persona
    INNER JOIN puestos_trabajos pt ON emp.id_puesto = pt.id_puesto
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

const agregarEmpleado = async (req, res) => {
    const {nombre, apellido, sexo, fecha_nacimiento, telefonos, correo, id_puesto} = req.body;

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

                    const sql_empleado = "INSERT INTO empleados (id_puesto, id_persona) VALUES (?,?)";
                    conexionDB.query(sql_empleado, [id_puesto, id_persona], (error, resultsMedico) => {
                        if (error) {
                            console.error('Error al insertar en la tabla empleados:', error);
                            return conexionDB.rollback(() => {
                                res.status(500).send('Error al insertar en la tabla empleados.');
                            });
                        };

                          // Confirmar la transacción
                        conexionDB.commit((err) => {
                            if (err) {
                                console.error('Error al confirmar la transacción:', err);
                                return conexionDB.rollback(() => {
                                    res.status(500).send('Error al confirmar la transacción.');
                                });
                            }
                            
                        console.log('Transacción completada exitosamente');
                        console.log('Registro de empleado exitoso');
                        res.status(200).send('Registro de empleado exitoso!');
                    });
                  });
                });
            });
        });
    });
};

const editarEmpleado = async (req, res) => {
    const {nombreEditar, apellidoEditar, telefonoEditar, correoEditar, id_puestoEditar} = req.body;
    const id_empleado = req.params.id_empleado;

    if (!id_empleado) {
        return res.status(400).json({ message: "ID empleado no proporcionado." });
    }

    try {
        // Iniciar la transacción
        conexionDB.beginTransaction();

        // Obtener id_persona desde la tabla medico
        const idPersonaResult = await ejecutarConsulta("SELECT id_persona FROM empleados WHERE id_empleado = ?", [id_empleado]);
        const id_persona = idPersonaResult[0].id_persona;

        // Actualizar registros
        const sql_registro = "UPDATE registros SET nombres = ?, apellidos = ? WHERE id_registro = ?";
        await ejecutarConsulta(sql_registro, [nombreEditar, apellidoEditar, id_persona]);

        // Actualizar datos_personales
        const sql_datos_personales = "UPDATE datos_personales SET telefonos = ?, correo = ? WHERE id_persona = ?";
        await ejecutarConsulta(sql_datos_personales, [telefonoEditar, correoEditar, id_persona]);

        // Actualizar la tabla empleados
        const sql_empleado = "UPDATE empleados SET id_puesto = ? WHERE id_empleado = ?";
        await ejecutarConsulta(sql_empleado, [id_puestoEditar, id_empleado]);

        // Confirmar la transacción
        conexionDB.commit();

        console.log('Transacción completada exitosamente');
        console.log('Editar empleado exitoso');
        res.status(200).send('Editar empleado exitoso!');
    } catch (error) {
        console.error('Error al editar empleado:', error);
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


const eliminarEmpleado = async (req, res) => {
    const id_empleado = req.params.id_empleado;
    
    if (!id_empleado) {
        return res.status(400).json({ message: "ID empleado no proporcionado." });
    }

    const sql = `DELETE FROM empleados WHERE id_empleado = ?`;
    conexionDB.query(sql, [id_empleado], (error, results) => {
        if (error) {
            console.error("Error al eliminar el empleado:", error);
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // Verificar si se eliminó correctamente el empleado
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Empleado no encontrado." });
        }

        // El empleado se eliminó correctamente
        console.log('Empleado eliminado exitosamente');
        return res.status(200).json({ message: "Empleado eliminado correctamente." });
    });
  
}


module.exports = {consultarEmpleados, agregarEmpleado, editarEmpleado, eliminarEmpleado}