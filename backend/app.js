const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const expressip = require('express-ip');
const helmet = require('helmet');

//on importe les routes
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//on récupère le mot de passe depuis les variables d'environnement système (données stockées localement sur mon ordinateur)
const mongoPassword = process.env.MONGO_PASSWORD;

mongoose.connect(`mongodb+srv://sauceUser:${mongoPassword}@cluster0.isjgy.mongodb.net/principal?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


app.use((req, res, next) => {
    //on autorise que la communication entre le frontend et le backend
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//on utilise helmet pour éviter certaines failles XSS mais aussi pour cacher des informations sur le serveur qu'on utilise
app.use(helmet());

app.use(expressip().getIpInfoMiddleware);

app.use(bodyParser.json());

//pour enregistrer les images qui est un dossier static
app.use('/images', express.static(path.join(__dirname, 'images')));

//pour enregistrer les routes
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;