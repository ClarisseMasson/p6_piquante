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
            //...on supprime le fichier puis
            fs.unlink(`images/${filename}`, () => {
                //puis deleteOne pour supprimer l'objet de la base
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

////on ajoute un avis à la sauce
//exports.addReviewSauce = (req, res, next) => {
//    //il faut d'abord que j'initialise les like et dislike à 0 et les tableaux [] dans le post de la sauce (pour la modification A VOIR)
//    console.log(req.params.id);
//    //si le nombre est inférieur à 0 on veut unliker et on ajoute l'id de l'utilisateur dans le tableau dislike
//    //on vérifie dans le tableau dislike si l'id de l'utilisateur est déja existant, si il l'ai on ne l'ajoute pas 
//    //on vérifie dans le tableau like si l'id de l'utilisateur est déja existant, si il l'ai on le supprime
//    Sauce.findOne({ _id: req.params.id })
//        .then(sauce => {
//            console.log(req.body);
//            var review = { ...req.body };

//            console.log("message");
//            //si le nombre est égale à 0 et donc que l'utilisateur à cliqué sur avis positif et négatif alors...
//            if (review.like === 0) {
//                console.log('1');
//                 //on enlève son userId dans le tableau usersLiked
//                const index = sauce.usersLiked.find((sauce, index) => {
//                    if (review.userId === sauce) {
//                        return index;
//                    }
//                });
//                sauce.userLiked.splice(index, 1);
//                sauce.likes -= 1;
//                //on enlève son userId aussi dans le tableau usersDisliked
//                const indexDisliked = sauce.usersDisliked.find((sauce, indexDisliked) => {
//                    if (review.userId === sauce) {
//                        return indexDisliked;
//                    }
//                });
//                sauce.userDisliked.splice(indexDisliked, 1);
//                sauce.dislikes -= -1;
//                Sauce.updateOne({ _id: req.params.id }, sauce )
//                    .then(() => res.status(200).json({ message: 'Avis retourne à neutre!' }))
//                    .catch(error => res.status(500).json({ error }));
//            } else if (review.like === -1) {
//                console.log('2');
//                sauce.dislikes += 1;
//                sauce.usersDisliked.push(review.userId);
//                Sauce.updateOne({ _id: req.params.id }, sauce)
//                    .then(() => res.status(200).json({ message: 'Votre avis négatif a bien été pris en compte !' }))
//                    .catch(error => res.status(404).json({ error }));
//            } else {
//                console.log('3');
//                sauce.likes += 1;
//                sauce.usersLiked.push(review.userId);
//                Sauce.updateOne({ _id: req.params.id }, sauce)
//                    .then(() => res.status(200).json({ message: 'Votre avis positif a bien été pris en compte !' }))
//                    .catch(error => res.status(404).json({ error }));
//            }
//        })
//        .catch(error => res.status(404).json({ error, message: 'erreur ici' }));

//};