const jwt = require('jsonwebtoken'); // jsonwebtoken plugin，Token
require('dotenv').config();

module.exports = (req, res, next) => {
   try {
       // Authorization: Bearer <token123>
       const token = req.headers.authorization.split(' ')[1];

       // jwt.verify(token, KEY)  verifier le token si le token est valide
       const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

       // User ID
       const userId = decodedToken.userId;

       // userId save  req.auth 
       req.auth = {
           userId: userId
       };

       // next middleware
       next();
   } catch(error) {
       res.status(401).json({ error });
   }
};