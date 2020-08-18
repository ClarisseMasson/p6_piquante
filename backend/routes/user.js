//on a besoin d'express pour cr�er un router
const express = require('express');

//fonction router de express
const router = express.Router();

//on associe avec le user du fichier controller en indiquant son chemin
const userCtrl = require('../controllers/user');

//N'oubliez pas que le segment de route indiqu� ici est uniquement le segment final, car le reste de l'adresse de la route sera d�clar� dans notre application Express.
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

//on exporte le router pour qu'on puisse l'importer dans app.js
module.exports = router;