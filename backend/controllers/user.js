const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// signup controller

// ==========================================
// 2. 注册逻辑 (SIGNUP)
// ==========================================
exports.signup = (req, res, next) => {
    // 拦截密码为空的情况
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
                        // 👉 关键修改：检查错误信息里有没有 "unique" (重复) 这个词
                        if (error.message.includes('unique')) {
                            return res.status(400).json({ 
                                message: "Cet adresse email est déjà utilisée. (Error 400 Bad Request)" 
                            });
                        }
                        
                        // 如果没有 "unique"，那才是真的没填
                        return res.status(400).json({ 
                            message: "L'adresse email et le mot de passe sont requis. (Error 400 Bad Request)" 
                        });
                    }
                    
                    // 情况3: 邮箱已存在
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

// ==========================================
// 3. 登录逻辑 (LOGIN) - 含 JWT
// ==========================================
// ==========================================
// 3. 登录逻辑 (LOGIN) - 区分报错版
// ==========================================
exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
       .then(user => {
           // 🛑 情况 A：用户不存在 (User not found)
           if (!user) {
               // 👇 这里改成你想要的特定提示
               return res.status(401).json({ 
                   message: "Cet utilisateur n'existe pas. Veuillez vous inscrire. (Error 401)" 
               });
           }
           
           // 🛑 情况 B：验证密码
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   // 密码错误
                   if (!valid) {
                       // 👇 密码错了报这个
                       return res.status(401).json({ 
                           message: 'Mot de passe incorrect. (Error 401)' 
                       });
                   }
                   
                   // 🎉 登录成功，生成 Token
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           'RANDOM_TOKEN_SECRET', 
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};