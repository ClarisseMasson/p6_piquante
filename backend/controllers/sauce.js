const Sauce = require('../models/Sauce');
//file system pour avoir accès aux différents systèmes de fichier
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    //on extrait le json du sauce
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    //L'opérateur spread "..." est utilisé pour faire une copie de tous les éléments de sauceObjet
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0 ,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.modifySauce = (req, res, next) => {
    //si on trouve un fichier alors...
    const sauceObjet = req.file ?
        {
        //...on recupère la chaine de caractère on la parse en objet et on modifie l'image url
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
        //...sinon on prend le corps de la requête
        : { ...req.body };
    //re.params.id est comme un getElementById
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
        .catch(error => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //...on recupère le nom du fichier par rapport à l'url image créée, soit ce qui se trouve après /images/
            const filename = sauce.imageUrl.split('/images/')[1];
            //...on supprime le fichier du dossier images
            fs.unlink(`images/${filename}`, () => {
                //puis deleteOne pour supprimer aussi l'objet de la base de la donnée
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(404).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));

};

exports.getOneSauce = (req, res, next) => {
    //nous utilisons la méthode find() dans notre modèle Mongoose mais pour une seule sauce
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    //nous utilisons la méthode find() dans notre modèle Mongoose afin de renvoyer un tableau contenant tous les sauces dans notre base de données. 
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));

};

//on ajoute un avis à la sauce
exports.addReviewSauce = (req, res, next) => {
    //Attention, il faut d'abord que j'initialise les like et dislike à 0 et les tableaux [] dans le post de la sauce (pour la modification A VOIR)
    //on recherche la sauce selon son id
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            var review = { ...req.body };
            //si le client clique sur le pouce levé et que le message renvoyé de like est 1 alors...
            if (review.like == 1) {
                //...on ajoute au tableau usersLiked l'id du client
                sauce.usersLiked.push(review.userId);
                //...après l'ajout, on récupère le nombre de personnes ayant "liké" la sauce
                sauce.likes = sauce.usersLiked.length;
                //...on met à jout la sauce
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Votre avis positif a bien été pris en compte !' }))
                    .catch(error => res.status(404).json({ error }));
            }
            //si le client clique sur le pouce baissé et que le message renvoyé de like est -1 alors...
            else if (review.like == -1) {
                //...on ajoute au tableau usersDisliked l'id du client
                sauce.usersDisliked.push(review.userId);
                //...après l'ajout, on récupère le nombre de personnes ayant "disliké" la sauce
                sauce.dislikes = sauce.usersDisliked.length;
                //...on met à jout la sauce
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Votre avis négatif a bien été pris en compte !' }))
                    .catch(error => res.status(404).json({ error }));
            }
            //si le client reclique sur son avis et que le message renvoyé de like est 0 alors...
            else {
                //...on va chercher si l'id de l'utilisateur est présent dans les tableaux usersLiked et usersDislikes et surtout son index dans le tableau, puis nommer cette index
                const reviewIdLike = sauce.usersLiked.indexOf(review.userId);
                const reviewIdDislike = sauce.usersDisliked.indexOf(review.userId);
                //si il y l'identifiant de l'utilisteur correspond à un identifiant de notre tableau userLikes alors...
                if (sauce.usersLiked.includes(review.userId)) {
                    //...on l'enlève du tableau usersLiked en utilisant l'index préalablement calculé et on s'arrête d'enlever des éléments juste après
                    sauce.usersLiked.splice(reviewIdLike, 1);
                }
                //si il y l'identitfiant de l'utilisateur correspond à un identifiant de notre tableau userDislikes alors...
                else if (sauce.usersDisliked.includes(review.userId)) {
                    //...on l'enlève du tableau usersDisiked en utilisant l'index préalablement calculé et on s'arrête d'enlever des éléments juste après
                    sauce.usersDisliked.splice(reviewIdDislike, 1);
                }
                else {
                    console.log(err);
                }
                //...on recalcule le nombre de personnes ayant disliké et liké, puis on met à jour la sauce
                sauce.likes = sauce.usersLiked.length;
                sauce.dislikes = sauce.usersDisliked.length;
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Retour à 0 !' }))
                    .catch(error => res.status(404).json({ error }));
            }
         
        })
        .catch(error => res.status(404).json({ error}));

};