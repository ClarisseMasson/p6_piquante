const mongoose = require('mongoose');

//installer le package en ligne de commande
//npm install--save mongoose - unique - validator
//puis rajouter le plug-in dans notre code
const uniqueValidator = require('mongoose-unique-validator');

//"unique: true" pour que une seule personne puisse s'inscrire avec cet email
//(cependant cela bug defois avec mongoose, on rajoute alors un plugin)
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginAttempt: { type : Number, required : true}
});

//on applique le validator avant d'en faire un model
userSchema.plugin(uniqueValidator);

//exporter le schema sous forme de model
//on utilise la fonction modele de mongoose "mongoose.model"
//le model s'appelle User et on passe userSchema comme schéma de données
module.exports = mongoose.model('User', userSchema);