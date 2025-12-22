// 1. 先引入所有需要的包 (顺序非常重要！)
const express = require('express'); // 👈 必须在第一行！
const mongoose = require('mongoose');

const bookRoutes = require('./routes/books'); // 引入路由
const userRoutes = require('./routes/user');
// 2. 初始化 app (这一步必须在引入 express 之后)
const app = express();
const path = require('path');

// 3. 连接数据库
mongoose.connect('mongodb+srv://Yang:930929@cluster0.bwiqeah.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

// 4. 解析 JSON 数据
app.use(express.json());

// 5. 设置 CORS 头 (允许跨域)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// 6. 注册路由 Name
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// 7. 导出 app
module.exports = app;