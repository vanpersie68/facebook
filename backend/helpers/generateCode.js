//生成验证码
function generateCode(length){
    let code = "";
    let schema = "0123456789";
    for(let i=0; i<length; i++){
        code = code + schema.charAt(Math.floor(Math.random() * schema.length));
    }

    return code;
}

module.exports = generateCode;