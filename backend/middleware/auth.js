const jwt = require('jsonwebtoken'); // 引入 jsonwebtoken 插件，专门用来生成和查验 Token
 
module.exports = (req, res, next) => {
   try {
       // 1. 提取 Token
       // 前端发来的 Header 格式通常是："Authorization: Bearer <token字符串>"
       // split(' ') 把字符串按空格切开变成数组：['Bearer', '<token字符串>']
       // [1] 取数组的第二个元素，也就是真正的 token 字符串
       const token = req.headers.authorization.split(' ')[1];

       // 2. 验证 Token
       // jwt.verify(token, 密钥) 用来检查 Token 是否是伪造的、是否过期。
       // 'RANDOM_TOKEN_SECRET' 是密钥，必须和你登录(Login)时生成 Token 用的密钥完全一致！
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

       // 3. 提取用户信息 (User ID)
       // 如果验证通过，decodedToken 里就包含了之前加密进去的数据（payload），这里取出 userId
       const userId = decodedToken.userId;

       // 4. 把 User ID 挂载到请求对象 (req) 上
       // 这步非常关键！为了让后面的代码（比如修改书、删除书的 controller）
       // 知道“当前是谁在操作”，我们将 userId 存进 req.auth 对象里。
       req.auth = {
           userId: userId
       };

       // 5. 放行
       // 一切正常，调用 next() 把请求传给下一个中间件（也就是你的业务逻辑控制器）
       next();
   } catch(error) {
       // 6. 抓捕错误
       // 如果 token 没传、或者 token 是假的、过期的，verify 会报错，直接跳到这里
       // 返回 401 Unauthorized (未授权)
       res.status(401).json({ error });
   }
};