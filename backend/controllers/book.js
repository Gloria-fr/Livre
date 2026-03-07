// backend/controllers/book.js
const Book = require('../models/Book'); 
const fs = require('fs');

// API : CreateBook -> POST /api/books
exports.createBook = (req, res, next) => {
 // livre du front
const bookObject = JSON.parse(req.body.book);

  // Nettoyage ID du font
  delete bookObject._id;
  delete bookObject._userId;

  // Book instance
  const book = new Book({
      ...bookObject, 
      userId: req.auth.userId, // userId du token 
      // URL de l'image 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // save MongeDB
  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};


// API : GetOneBook -> GET /api/books/:id
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// API : ModifyBook -> PUT /api/books/:id
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { 
        ...req.body 
    };
  
    delete bookObject._userId;
  
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // book exist pas
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !'});
            }

            // ID (req.auth.userId) === ID
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                // mettre à jour le livre
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(403).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

// API : DeleteBook -> DELETE /api/books/:id
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !'});
            }

            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                // http://localhost:4000/images/123.jpg
                // split('/images/')[1] = 123.jpg"
                const filename = book.imageUrl.split('/images/')[1];

                // fs.unlink supprime le fichier du serveur
                fs.unlink(`images/${filename}`, () => {
                    // supprimer le livre BBD
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(403).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

// API : GetAllBooks -> GET /api/books
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// API : RateBook -> POST /api/books/:id/rating
exports.rateBook = (req, res, next) => {
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      // some
      const hasRated = book.ratings.some(rating => rating.userId === req.body.userId);
      if (hasRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // Ajouter la nouvelle note
      book.ratings.push({
        userId: req.body.userId,
        grade: req.body.rating
      });

      // la note moyenne
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = parseFloat((totalRatings / book.ratings.length).toFixed(1));

      return book.save();
    })
    .then(updatedBook => res.status(200).json(updatedBook))
    .catch(error => res.status(500).json({ error }));
};

// API : GetBestRating -> GET /api/books/bestrating
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};