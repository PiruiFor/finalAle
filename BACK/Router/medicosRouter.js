const express = require('express');
const router = express.Router();
const {consultarMedicos, agregarMedicos, editarMedicos, eliminarMedicos} = require('../Controllers/medicosController')



router.get('/', consultarMedicos)
router.post('/', agregarMedicos)
router.put('/:id_medico', editarMedicos)
router.delete('/:id_medico', eliminarMedicos)


module.exports = router;