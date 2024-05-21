// 用来发送邮件
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const {EMAIL, MAILING_ID, MAILING_SECRET, MAILING_REFRESH} = process.env;
const oauth_link = "https://developers.google.com/oauthplayground";

//使用获取的邮件发送者 ID、密钥和刷新令牌创建 OAuth2 实例。
const auth = new OAuth2(
    MAILING_ID, 
    MAILING_SECRET,
    MAILING_REFRESH,
    oauth_link
);

//导出一个函数 sendVerificationEmail，接受收件人邮箱、用户姓名和激活链接 URL 作为参数。
exports.sendVerificationEmail = (email, name, url) => {
    //使用刷新令牌设置 OAuth2 凭证。
    auth.setCredentials({
        refresh_token: MAILING_REFRESH,
    });

    //获取访问令牌，用于进行邮件发送的身份验证。
    const accessToken = auth.getAccessToken();
    //使用 nodemailer 创建一个 SMTP 邮件传输器，配置使用 OAuth2 进行身份验证。
    const stmp = nodemailer.createTransport({
        service: "gmail",
        auth:{
            type: "OAuth2",
            user: EMAIL,
            clientId: MAILING_ID,
            clientSecret: MAILING_SECRET,
            refreshToken: MAILING_REFRESH,
            accessToken,
        }
    });

    //定义包含邮件信息的选项，包括发件人、收件人、主题和 HTML 格式的邮件内容。
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "Facebook email verification",
        html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto;font-weight:600;color:#3b5998"><img src="E:\frontCode\myCode\studyreact\facebook\backend\assets\images" alt="" style="width:30px"><span>Action requise : Activate your facebook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently created an account on Facebook. To complete your registration, please confirm your account.</span></div><a href=${url} style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook allows you to stay in touch with all your friends, once refistered on facebook,you can share photos,organize events and much more.</span></div></div>`,
    };

    //使用创建的 SMTP 传输器发送邮件，包括错误处理。
    stmp.sendMail(mailOptions, (err, res) => {
        if(err) return err;
        return res;
    });
};

//通过邮箱发送验证码
exports.sendResetCode = (email, name, code) => {
    auth.setCredentials({
        refresh_token: MAILING_REFRESH,
    });

    const accessToken = auth.getAccessToken();
    const stmp = nodemailer.createTransport({
        service: "gmail",
        auth:{
            type: "OAuth2",
            user: EMAIL,
            clientId: MAILING_ID,
            clientSecret: MAILING_SECRET,
            refreshToken: MAILING_REFRESH,
            accessToken,
        }
    });

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "Reset facebook password",
        html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:30px"><span>Action requise : Activate your facebook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently created an account on Facebook. To complete your registration, please confirm your account.</span></div><a  style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">${code}</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook allows you to stay in touch with all your friends, once refistered on facebook,you can share photos,organize events and much more.</span></div></div>`,
    };
    
    stmp.sendMail(mailOptions, (err, res) => {
        if (err) return err;
        return res;
    });
};