// backend/routes/books.js
const express = require('express');
const router = express.Router();

const Book = require('../models/Book');


// Middleware
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// controllers
const bookCtrl = require('../controllers/book');

// API : GetAllBooks -> GET /api/books
router.get('/', bookCtrl.getAllBooks);

// API : GetBestRating -> GET /api/books/bestrating
router.get('/bestrating', bookCtrl.getBestRating); 

//  API : GetOneBook -> GET /api/books/:id
router.get('/:id', bookCtrl.getOneBook);

//  API : CreateBook -> POST /api/books
router.post('/', auth, multer, bookCtrl.createBook);

// API : ModifyBook -> PUT /api/books/:id
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// API : DeleteBook -> DELETE /api/books/:id
router.delete('/:id', auth, bookCtrl.deleteBook);

// API : RateBook -> POST /api/books/:id/rating
router.post('/:id/rating', auth, bookCtrl.rateBook);


module.exports = router;