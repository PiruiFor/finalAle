const express = require('express');
const router = express.Router();
const {consultarUsuarios, registrarUsuarios, editarUsuarios, eliminarUsuarios} = require('../Controllers/registerController')


router.get('/', consultarUsuarios);
router.post('/', registrarUsuarios);
router.put('/:id_usuario', editarUsuarios)
router.delete('/:id_usuario', eliminarUsuarios)

module.exports = router;