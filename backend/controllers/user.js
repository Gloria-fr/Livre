const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// signup controller
exports.signup = (req, res, next) => {
    // null
    if (!req.body.password) {
        return res.status(400).json({ 
            message: "L'adresse email et le mot de passe sont requis. (Error 400 Bad Request)" 
        });
    }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => {
                    if (error.name === 'ValidationError') {
                        if (error.message.includes('unique')) {
                            return res.status(400).json({ 
                                message: "Cet adresse email est déjà utilisée. (Error 400 Bad Request)" 
                            });
                        }
                        
                        // ll ny a pas de "unique"，vide
                        return res.status(400).json({ 
                            message: "L'adresse email et le mot de passe sont requis. (Error 400 Bad Request)" 
                        });
                    }
                    
                    // l'email 
                    if (error.code === 11000) {
                        return res.status(400).json({ 
                            message: "Cet adresse email est déjà utilisée. (Error 400 Bad Request)" 
                        });
                    }

                    res.status(500).json({ error: "Erreur serveur (Error 500)" });
                });
        })
        .catch(error => res.status(500).json({ error: "Erreur serveur (Error 500)" }));
};

// login controller
exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
       .then(user => {
           // User n'existe pas
           if (!user) {
               return res.status(401).json({ 
                   message: "Cet utilisateur n'existe pas. Veuillez vous inscrire. (Error 401)" 
               });
           }
           
           // User existe, comparer les mots de passe
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   // Mot de passe incorrect
                   if (!valid) {
                       return res.status(401).json({ 
                           message: 'Mot de passe incorrect. (Error 401)' 
                       });
                   }
                   
                   // Mot de passe correct, générer un token
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           process.env.JWT_SECRET, 
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};