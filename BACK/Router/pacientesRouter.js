const express = require('express');
const router = express.Router();
const {consultarPacientes, agregarPacientes, editarPacientes, eliminarPaciente} = require('../Controllers/pacientesController');


router.get('/', consultarPacientes)
router.post('/', agregarPacientes)
router.put('/:id_paciente', editarPacientes)
router.delete('/:id_paciente', eliminarPaciente)



module.exports = router;