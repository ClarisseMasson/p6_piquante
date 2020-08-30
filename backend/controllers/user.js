//on installe bcrypt pour crypter notre mot de passe avec "npm install--save bcrypt" en ligne de commmande
const bcrypt = require('bcrypt');
//on installe jsonwebtoken pour renvoyer notre token
const jwt = require('jsonwebtoken');
//on installe la fonction ip d'express pour v�rifier l'ip de notre utilisateur
const expressip = require('express-ip');

//pour r�cuperer le schema
const User = require('../models/user');


//2 fonctions, une pour s'inscrire, une pour se connecter avec un compte d�j� existant


//10 tours dans le hachoir
//fonction asynchrone
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //je v�rifie si l'email correspond bien � un format email pour �viter l'authentification malveillante
            const regex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
            if (!regex.test(req.body.email)) {
                res.status(400).json({ message: 'email invalide' });
            }
            else {
                //je v�rifie si le mot de passe a au moins 8 caract�res une majuscule et un nombre
                if (!passwordValidation(req.body.password)) {
                    res.status(400).json({ message: 'mot de passe pas assez fort, vous devez avoir au moins 8 caract�res, 1 majuscule et un nombre' });
                }
                else {
                    //on va saler le mot de passe pour �viter les attaques utilisant des rainbow tables,
                    //les attaques par dictionnaire et les attaques par force brute.
                    const user = new User({
                        email: req.body.email,
                        password: hash,
                        loginAttempt: 0
                    });
                    user.save()
                        .then(() => res.status(201).json({ message : 'Utilisateur cr�� !'}))
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(500).json({error}));
};


//On r�cup�re l'adresse mail de l'adresse rentr�
//si elle est bonne alors on compare le mot de passe "hach�" avec celui entr�
//si il est bon on va renvoy� un objet json avec son user._id et token
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouv� !' });
            }
            else if (user.loginAttempt > 3) {
                return res.status(401).json({ error: 'Trop de tentatives de connexion, votre compte a �t� bloqu� !' });
            }
            else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            //on ajoute 1 � la tentative de connexion
                            user.loginAttempt += 1;
                            //on met � jour le nombre de connexion dans user
                            User.updateOne({ email: req.body.email }, user)
                                .then(() => res.status(401).json({ message: 'Mot de passe incorrect !' }))
                                .catch(error => res.status(500).json({ error }));
                        }
                        else {
                            console.log("ici");
                            //on remet � 0 la tentative de connexion
                            user.loginAttempt = 0;
                            //on met � jour le nombre de connexion dans user
                            User.updateOne({ email: req.body.email }, user)
                                .then(() => {
                                    res.status(200).json({
                                        userId: user._id,
                                        token: jwt.sign(
                                            //on stocke �galement l'ip de l'utilisateur au moment de l'authentification et on v�rifira pour les requ�te suivant qu'il se connectera depuis le m�me endroit
                                            { userId: user._id, ip: req.ip },
                                            'RANDOM_TOKEN_SECRET',
                                            { expiresIn: '2h' }
                                        )
                                    });
                                })
                                .catch(error => res.status(500).json({ error }));
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};

function passwordValidation(password) {
    if (password.length >= 8 && password != password.toLowerCase() && /\d/.test(password)) {
        return true;
    }
    else {
        return false;
    }
}