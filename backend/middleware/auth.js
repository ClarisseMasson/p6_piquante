const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // "split(' ')[1] pour r�cup�rer le 2 �l�ment du tableau
        const token = req.headers.authorization.split(' ')[1];
        // on v�rifie le token et la cl� secr�te
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        //on v�rifie que l'ip est la m�me
        if (req.ip != decodedToken.ip) {
            throw 'Votre adresse a chang� au cours de votre session !';
        }
        // on r�cup�re l'userId
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'user ID non valable !';
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requ�te non authentifi� !' });
    }
};