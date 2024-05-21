const jwt = require("jsonwebtoken");

exports.authUser = async (req, res, next) => {
    try{
        // 从 "Authorization" 头中提取令牌
        let tmp = req.header("Authorization");
        const token = tmp ? tmp.slice(7, tmp.length) : ""; //前七位是Bearer + 空格，后七位才是token
        if(!token){
            return res.status(400).json({message: "Invalid Authorization"});
        }

        // 使用jsonwebtoken库验证令牌的有效性
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if(err) {
                return res.status(400).json({message: "Invalid Authorization"});
            } 
            // 如果验证通过，将用户信息添加到请求对象中
            req.user = user;
            // 继续执行下一个中间件或路由处理程序
            next();
        });
    } catch(error){
        return res.status(500).json({message: error.message});
    }
};