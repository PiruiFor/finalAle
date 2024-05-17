const express = require('express');
const router = express.Router();
const {consultarPersonas} = require('../Controllers/personasController')

router.get('/', consultarPersonas);


module.exports = router;