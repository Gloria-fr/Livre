const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  // userId
  userId: { type: String, required: true },
  
  // title: 
  title: { type: String, required: true },
  
  // author
  author: { type: String, required: true },
  
  // imageUrl
  imageUrl: { type: String, required: true },
  
  // year:Number
  year: { type: Number, required: true },
  
  // genre
  genre: { type: String, required: true },
  
  // ratings: groupe
  ratings: [
    {
      userId: { type: String, required: true }, // qui
      grade: { type: Number, required: true }   // note
    }
  ],
  
  // averageRating
  averageRating: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);