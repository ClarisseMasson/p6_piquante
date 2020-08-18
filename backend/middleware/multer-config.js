const multer = require('multer');

//dictionnaire pour MIME_TYPES
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};


//cela nous permet d'enregistrer des images, de gérer les fichiers entrants
const storage = multer.diskStorage({
    //on lui dit où mettre le fichier
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    //on lui dit comment le nommer
    filename: (req, file, callback) => {
        //on lui dit de reprendre le nom du fichier et de lui remplacer les espaces par des _
        //on traduit image/extension par l'extension
        //on lui dit de créer un fichier avec le noma vec les underscrore, le moment pour que ce soit unique, un point et enfin l'extension
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension)
    }
});

module.exports = multer({ storage }).single('image');