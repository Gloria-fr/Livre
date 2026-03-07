const express = require('express'); 
const mongoose = require('mongoose');

const bookRoutes = require('./routes/books'); 
const userRoutes = require('./routes/user');

const app = express();
const path = require('path');

// BDD694318b8bd5e144a0a181ef2
mongoose.connect('mongodb+srv://yang123:liyang930929@cluster0.bwiqeah.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

// JSON 
app.use(express.json());

// CORS 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;