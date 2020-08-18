const Sauce = require('../models/Sauce');
//file system pour avoir acc�s aux diff�rents syst�mes de fichier
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    //on extrait le json du sauce
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    //L'op�rateur spread "..." est utilis� pour faire une copie de tous les �l�ments de sauceObjet
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0 ,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistr� !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.modifySauce = (req, res, next) => {
    //si on trouve un fichier alors...
    const sauceObjet = req.file ?
        {
        //...on recup�re la chaine de caract�re on la parse en objet et on modifie l'image url
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
        //...sinon on prend le corps de la requ�te
        : { ...req.body };
    //re.params.id est comme un getElementById
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifi� !' }))
        .catch(error => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //...on recup�re le nom du fichier par rapport � l'url image cr��e, soit ce qui se trouve apr�s /images/
            const filename = sauce.imageUrl.split('/images/')[1];
            //...on supprime le fichier puis
            fs.unlink(`images/${filename}`, () => {
                //puis deleteOne pour supprimer l'objet de la base
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprim� !' }))
                    .catch(error => res.status(404).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));

};

exports.getOneSauce = (req, res, next) => {
    //nous utilisons la m�thode find() dans notre mod�le Mongoose mais pour une seule sauce
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    //nous utilisons la m�thode find() dans notre mod�le Mongoose afin de renvoyer un tableau contenant tous les sauces dans notre base de donn�es. 
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));

};

////on ajoute un avis � la sauce
//exports.addReviewSauce = (req, res, next) => {
//    //il faut d'abord que j'initialise les like et dislike � 0 et les tableaux [] dans le post de la sauce (pour la modification A VOIR)
//    console.log(req.params.id);
//    //si le nombre est inf�rieur � 0 on veut unliker et on ajoute l'id de l'utilisateur dans le tableau dislike
//    //on v�rifie dans le tableau dislike si l'id de l'utilisateur est d�ja existant, si il l'ai on ne l'ajoute pas 
//    //on v�rifie dans le tableau like si l'id de l'utilisateur est d�ja existant, si il l'ai on le supprime
//    Sauce.findOne({ _id: req.params.id })
//        .then(sauce => {
//            console.log(req.body);
//            var review = { ...req.body };

//            console.log("message");
//            //si le nombre est �gale � 0 et donc que l'utilisateur � cliqu� sur avis positif et n�gatif alors...
//            if (review.like === 0) {
//                console.log('1');
//                 //on enl�ve son userId dans le tableau usersLiked
//                const index = sauce.usersLiked.find((sauce, index) => {
//                    if (review.userId === sauce) {
//                        return index;
//                    }
//                });
//                sauce.userLiked.splice(index, 1);
//                sauce.likes -= 1;
//                //on enl�ve son userId aussi dans le tableau usersDisliked
//                const indexDisliked = sauce.usersDisliked.find((sauce, indexDisliked) => {
//                    if (review.userId === sauce) {
//                        return indexDisliked;
//                    }
//                });
//                sauce.userDisliked.splice(indexDisliked, 1);
//                sauce.dislikes -= -1;
//                Sauce.updateOne({ _id: req.params.id }, sauce )
//                    .then(() => res.status(200).json({ message: 'Avis retourne � neutre!' }))
//                    .catch(error => res.status(500).json({ error }));
//            } else if (review.like === -1) {
//                console.log('2');
//                sauce.dislikes += 1;
//                sauce.usersDisliked.push(review.userId);
//                Sauce.updateOne({ _id: req.params.id }, sauce)
//                    .then(() => res.status(200).json({ message: 'Votre avis n�gatif a bien �t� pris en compte !' }))
//                    .catch(error => res.status(404).json({ error }));
//            } else {
//                console.log('3');
//                sauce.likes += 1;
//                sauce.usersLiked.push(review.userId);
//                Sauce.updateOne({ _id: req.params.id }, sauce)
//                    .then(() => res.status(200).json({ message: 'Votre avis positif a bien �t� pris en compte !' }))
//                    .catch(error => res.status(404).json({ error }));
//            }
//        })
//        .catch(error => res.status(404).json({ error, message: 'erreur ici' }));

//};