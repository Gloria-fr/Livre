// backend/routes/books.js
const express = require('express');
const router = express.Router();

const Book = require('../models/Book');


// 引入中间件
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// 引入刚才创建的厨师（控制器）
const bookCtrl = require('../controllers/book');

// 1. 获取所有书 (公开)
router.get('/', bookCtrl.getAllBooks);

// 2. 获取最佳评分 (公开) - 注意：必须放在 /:id 之前！
router.get('/bestrating', bookCtrl.getBestRating); 

// 3. 获取单本书 (公开)
router.get('/:id', bookCtrl.getOneBook);

// 4. 创建书 (🔒 需要认证 + 📷 图片上传)
// 对应 Spec: POST /api/books -> Requis
router.post('/', auth, multer, bookCtrl.createBook);

// 5. 修改书 (🔒 需要认证 + 📷 图片上传)
// 对应 Spec: PUT /api/books/:id -> Requis
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// 6. 删除书 (🔒 需要认证)
// 对应 Spec: DELETE /api/books/:id -> Requis
router.delete('/:id', auth, bookCtrl.deleteBook);

// 7. 评分 (🔒 需要认证)
// 对应 Spec: POST /api/books/:id/rating -> Requis
router.post('/:id/rating', auth, bookCtrl.rateBook);


module.exports = router;