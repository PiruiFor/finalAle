const express = require('express');
const router = express.Router();
const {consultarEmpleados, agregarEmpleado, editarEmpleado, eliminarEmpleado} = require('../Controllers/empleadosController')


router.get('/', consultarEmpleados);
router.post('/', agregarEmpleado);
router.put('/:id_empleado', editarEmpleado);
router.delete('/:id_empleado', eliminarEmpleado);



module.exports = router;