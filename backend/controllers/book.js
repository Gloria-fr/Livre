// backend/controllers/book.js
const Book = require('../models/Book'); // 引入模型
const fs = require('fs');
// 1. 创建书籍
exports.createBook = (req, res, next) => {
  // 1.1 解析请求体中的 'book' 字符串为对象
  // 注意：前端发过来的时候字段名是 'book'
  // 🕵️‍♂️ 侦探日志：看看请求里到底有什么
    console.log("----------------- DEBUG START -----------------");
    console.log("1. 检查 Auth 信息:", req.auth); // 看看有没有 userId
    console.log("2. 检查文件 (Multer):", req.file); // 看看有没有 filename
    console.log("3. 检查 Body:", req.body); // 看看有没有 book 字符串
    console.log("----------------- DEBUG END -------------------");


  const bookObject = JSON.parse(req.body.book);

  // 1.2 删除前端可能发来的伪造 ID
  delete bookObject._id;
  delete bookObject._userId;

  // 1.3 创建新的 Book 实例
  const book = new Book({
      ...bookObject, // 展开解析后的书本数据
      userId: req.auth.userId, // 🔒 使用从 Token 解码出来的真实用户 ID
      // 📷 生成图片的完整 URL (例如: http://localhost:4000/images/文件名.jpg)
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // 1.4 保存到数据库
  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

// 2. 获取单本书
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// 3. 修改书籍
exports.modifyBook = (req, res, next) => {
    // 1. 判断请求里是否包含了新图片文件
    const bookObject = req.file ? {
        // 如果有文件：前端发过来的是 'book' 字符串，需要解析
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { 
        // 如果没文件：直接使用请求体里的 JSON
        ...req.body 
    };
  
    // 2. 删除请求里可能的 _userId，防止有人伪造更改所有者
    delete bookObject._userId;
  
    // 3. 先从数据库里找到这本书，看看是谁的
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // 如果书不存在
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !'});
            }

            // 4. 权限检查：如果当前操作人的 ID (req.auth.userId) 不等于书原本的作者 ID
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                // 5. 所有的都没问题，执行更新
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

// 4. 删除书籍
exports.deleteBook = (req, res, next) => {
    // 1. 先找到这本书，目的是获取它的图片路径，并检查权限
    Book.findOne({ _id: req.params.id})
        .then(book => {
            // 如果书不存在
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !'});
            }

            // 2. 权限验证：确保只有创建这本书的人才能删除它
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                // 3. 提取文件名
                // book.imageUrl 可能是 "http://localhost:4000/images/文件名.jpg"
                // split('/images/')[1] 就是取 "文件名.jpg"
                const filename = book.imageUrl.split('/images/')[1];

                // 4. 使用 fs.unlink 删除硬盘上的图片文件
                fs.unlink(`images/${filename}`, () => {
                    // 5. 图片删成功后，再删除数据库里的记录
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

// 5. 获取所有书籍
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// 6. 评分功能
exports.rateBook = (req, res, next) => {
  // 简单验证
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      // 检查是否已评过分
      const hasRated = book.ratings.some(rating => rating.userId === req.body.userId);
      if (hasRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // 添加新评分
      book.ratings.push({
        userId: req.body.userId,
        grade: req.body.rating
      });

      // 计算平均分
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = parseFloat((totalRatings / book.ratings.length).toFixed(1));

      return book.save();
    })
    .then(updatedBook => res.status(200).json(updatedBook))
    .catch(error => res.status(500).json({ error }));
};

// 7. 获取最佳评分
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};