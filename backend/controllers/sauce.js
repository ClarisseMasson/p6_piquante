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
            //...on supprime le fichier du dossier images
            fs.unlink(`images/${filename}`, () => {
                //puis deleteOne pour supprimer aussi l'objet de la base de la donn�e
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

//on ajoute un avis � la sauce
exports.addReviewSauce = (req, res, next) => {
    //Attention, il faut d'abord que j'initialise les like et dislike � 0 et les tableaux [] dans le post de la sauce (pour la modification A VOIR)
    //on recherche la sauce selon son id
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            var review = { ...req.body };
            //si le client clique sur le pouce lev� et que le message renvoy� de like est 1 alors...
            if (review.like == 1) {
                //...on ajoute au tableau usersLiked l'id du client
                sauce.usersLiked.push(review.userId);
                //...apr�s l'ajout, on r�cup�re le nombre de personnes ayant "lik�" la sauce
                sauce.likes = sauce.usersLiked.length;
                //...on met � jout la sauce
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Votre avis positif a bien �t� pris en compte !' }))
                    .catch(error => res.status(404).json({ error }));
            }
            //si le client clique sur le pouce baiss� et que le message renvoy� de like est -1 alors...
            else if (review.like == -1) {
                //...on ajoute au tableau usersDisliked l'id du client
                sauce.usersDisliked.push(review.userId);
                //...apr�s l'ajout, on r�cup�re le nombre de personnes ayant "dislik�" la sauce
                sauce.dislikes = sauce.usersDisliked.length;
                //...on met � jout la sauce
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Votre avis n�gatif a bien �t� pris en compte !' }))
                    .catch(error => res.status(404).json({ error }));
            }
            //si le client reclique sur son avis et que le message renvoy� de like est 0 alors...
            else {
                //...on va chercher si l'id de l'utilisateur est pr�sent dans les tableaux usersLiked et usersDislikes et surtout son index dans le tableau, puis nommer cette index
                const reviewIdLike = sauce.usersLiked.indexOf(review.userId);
                const reviewIdDislike = sauce.usersDisliked.indexOf(review.userId);
                //si il y l'identifiant de l'utilisteur correspond � un identifiant de notre tableau userLikes alors...
                if (sauce.usersLiked.includes(review.userId)) {
                    //...on l'enl�ve du tableau usersLiked en utilisant l'index pr�alablement calcul� et on s'arr�te d'enlever des �l�ments juste apr�s
                    sauce.usersLiked.splice(reviewIdLike, 1);
                }
                //si il y l'identitfiant de l'utilisateur correspond � un identifiant de notre tableau userDislikes alors...
                else if (sauce.usersDisliked.includes(review.userId)) {
                    //...on l'enl�ve du tableau usersDisiked en utilisant l'index pr�alablement calcul� et on s'arr�te d'enlever des �l�ments juste apr�s
                    sauce.usersDisliked.splice(reviewIdDislike, 1);
                }
                else {
                    console.log(err);
                }
                //...on recalcule le nombre de personnes ayant dislik� et lik�, puis on met � jour la sauce
                sauce.likes = sauce.usersLiked.length;
                sauce.dislikes = sauce.usersDisliked.length;
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Retour � 0 !' }))
                    .catch(error => res.status(404).json({ error }));
            }
         
        })
        .catch(error => res.status(404).json({ error}));

};