const express = require('express');
const router = express.Router();

// on importe les middleware dont on a besoin avec leur chemin
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

//attention on vérifie avant tout l'authentification
router.post('/', auth, multer, sauceCtrl.createSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.delete('/:id', auth, sauceCtrl.deleteSauce);

//id est ci dessous dynamique grace aux deux points
router.get('/:id', auth, sauceCtrl.getOneSauce);

router.get('/', auth, sauceCtrl.getAllSauces);

//on définie l'adresse de like pas like
router.post('/:id/like', auth, sauceCtrl.addReviewSauce);


module.exports = router;