const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Book = require('./models/Book');

// 直接给一个字符串就行了，不需要那个花括号对象了
mongoose.connect('mongodb+srv://Yang:930929@cluster0.bwiqeah.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

app.use(express.json());

// 2. CORS 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// 1.POST 创建一本书 (对应添加书籍页面)
app.post('/api/books', (req, res, next) => {
  delete req.body._id; 
  const book = new Book({
    ...req.body
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

// 2. POST 打分/api/books/:id/rating
app.post('/api/books/:id/rating', (req, res, next) => {
  // 2.1 检查分数是否有效 (0-5分)
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  // 2.2 找到这本书
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // 检查书是否存在
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // 2.3 检查该用户是否已经打过分了 (防止重复刷分)
      // 数组里的某些对象是否包含当前用户的 ID？
      const hasRated = book.ratings.some(rating => rating.userId === req.body.userId);
      if (hasRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      // 2.4 把新的评分推入数组
      // 注意：前端发来的是 rating，数据库字段叫 grade
      book.ratings.push({
        userId: req.body.userId,
        grade: req.body.rating
      });

      // 2.5 【核心逻辑】重新计算平均分
      // totalRatings: 算出所有分数的总和
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      
      // 新平均分 = 总分 / 评分人数
      // toFixed(1) 保留一位小数，但这会变成字符串，所以用 parseFloat 转回数字
      book.averageRating = parseFloat((totalRatings / book.ratings.length).toFixed(1));

      // 2.6 保存并返回更新后的书
      return book.save();
    })
    .then(updatedBook => res.status(200).json(updatedBook)) // 返回更新后的书对象
    .catch(error => res.status(500).json({ error }));
});

// 3. 更新书籍 (PUT)
// 对应文档中的 PUT /api/books/:id
app.put('/api/books/:id', (req, res, next) => {
  // logic: 找到 ID 为 req.params.id 的书，用 req.body 里的新数据替换它
  // 注意：{ ...req.body, _id: req.params.id } 是为了防止有人在 body 里恶意篡改 ID，
  // 我们强制使用 URL 里的 ID。
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !'}))
    .catch(error => res.status(400).json({ error }));
});

// 4. 删除书籍 (DELETE)
// 对应文档中的 DELETE /api/books/:id
app.delete('/api/books/:id', (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
    .catch(error => res.status(400).json({ error }));
});

// 5. GET 对应文档中的 GET /api/books/bestrating
// 注意：这行代码必须放在 /api/books/:id 之前！
app.get('/api/books/bestrating', (req, res, next) => {
  // 1. 查找所有书
  Book.find()
    // 2. sort({ averageRating: -1 }): 按 averageRating 降序排序
    //    -1 表示从大到小 (5, 4, 3...)
    //     1 表示从小到大
    .sort({ averageRating: -1 })
    
    // 3. limit(3): 只取前 3 条结果
    .limit(3)
    
    // 4. 返回结果
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
});


// 6. 获取单本书籍 (对应点击一本书后的详情页)
app.get('/api/books/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
});


// 7.GET 获取所有书籍 (对应首页列表)
app.get('/api/books', (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
});


module.exports = app;