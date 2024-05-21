const { sendVerificationEmail, sendResetCode } = require("../helpers/mailer");
const { generateToken } = require("../helpers/token");
const { validateEmail, validateLength, validateUsername } = require("../helpers/validation");
const generateCode = require("../helpers/generateCode");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Cookie = require("js-cookie");
const Code = require("../models/Code");
const Post = require("../models/Post");
const mongoose = require("mongoose");

//注册
exports.register = async(req, res) => {
    try{
        const {
            first_name,
            last_name,
            email,
            password,
            username,
            bYear,
            bMonth,
            bDay,
            gender,
        } = req.body;

        if(!validateEmail(email)){
            return res.status(400).json({
                message: "invalid email address",
            });
        }

        //在数据库中查找是否有相同的邮箱
        const check = await User.findOne({ email });
        if(check){
            return res.status(400).json({
                message: "This email already exists, try with a different email address",
            });
        }

        if(!validateLength(first_name, 3, 30)){
            return res.status(400).json({
                message: "First name must between 3 and 30 characters.",
            });
        }

        if(!validateLength(last_name, 3, 30)){
            return res.status(400).json({
                message: "Last name must between 3 and 30 characters.",
            });
        }

        if (!validateLength(password, 6, 40)) {
            return res.status(400).json({
                message: "password must be atleast 6 characters.",
            });
        }

        //密码加密
        const cryptedPassword = await bcrypt.hash(password, 12);
        let tempUsername = first_name + last_name;
        let newUsername = await validateUsername(tempUsername);
        
        //当所有的都通过后，保存用户信息到数据库
        const user = await new User({
            first_name,
            last_name,
            email,
            password: cryptedPassword,
            username: newUsername,
            bYear,
            bMonth,
            bDay,
            gender,
        }).save();

        //在mongoDB中通常有一个唯一标识符，通常用 _id 代替
        //生成一个包含用户 ID 信息的邮箱验证令牌，有效期为 30 分钟。
        const emailVerificationToken = generateToken({id: user._id.toString()}, "30m");
        
        //构建一个激活链接的 URL，其中包含生成的邮箱验证令牌。这个链接将被包含在发送给用户的验证邮件中。
        const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
        //将验证邮件发送给用户。邮件中包含了激活链接，用户需要点击该链接完成邮箱验证。
        sendVerificationEmail(user.email, user.first_name ,url);
        //再次使用 generateToken 函数生成一个用户身份验证令牌，有效期为 7 天。
        const token = generateToken({id: user._id.toString()}, "7d");
        //将包含用户信息和生成的用户身份验证令牌的 JSON 对象发送给客户端，提示用户注册成功，但需要激活邮箱才能开始使用。
        res.send({
            id: user._id,
            username: user.username,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
            token: token,
            verified: user.verified,
            message: "Register Success! Please activate your email to start",
        });       
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//激活邮箱
exports.activateAccount = async (req, res) => {
    try {
        //获取请求对象中已认证的用户的id。通常，这个信息是通过身份验证中间件设置的，它可能包含在用户登录时生成的令牌中。
        const validUser = req.user.id; //现在登录的用户

        //从请求体中获取传递过来的token，这个token可能包含用户信息。
        const { token } = req.body;

        //使用jsonwebtoken库的verify方法，通过提供的密钥（process.env.TOKEN_SECRET）对令牌进行验证。如果令牌有效，user对象将包含从令牌中提取的用户信息。
        const user = jwt.verify(token, process.env.TOKEN_SECRET); //接受email的用户
        const check = await User.findById(user.id);

        //验证 接收邮件的用户 和 正在登录的用户的 id是否匹配
        if(validUser !== user.id){
            return res.status(400).json({message: "You don't have the authorization to complete this operation. "});
        }

        if (check.verified == true) {
            return res
            .status(400)
            .json({ message: "this email is already activated" });
        } else {
            await User.findByIdAndUpdate(user.id, { verified: true });
            return res
            .status(200)
            .json({ message: "Account has beeen activated successfully." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//登录
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "The email address you entered is not connected to and account."});
        }

        const check = await bcrypt.compare(password, user.password);
        if(!check){
            return res.status(400).json({message: "Invalid password. Please try again.",});
        }

        const token = generateToken({ id: user._id.toString()}, "7d");
        res.send({
            id: user._id,
            username: user.username,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
            token: token,
            verified: user.verified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//用户登陆后，一些用户没有激活邮箱，进行邮箱的激活
exports.sendVerification = async (req, res) => {
    try{
        const id = req.user.id;
        const user = await User.findById(id);
        if(user.verified === true){
            return res.status(400).json({
                message: "This account is already activated.",
            });
        }

        //生成一个包含用户 ID 信息的邮箱验证令牌，有效期为 30 分钟。
        const emailVerificationToken = generateToken({id: user._id.toString()}, "30m");
        //构建一个激活链接的 URL，其中包含生成的邮箱验证令牌。这个链接将被包含在发送给用户的验证邮件中。
        const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
        //将验证邮件发送给用户。邮件中包含了激活链接，用户需要点击该链接完成邮箱验证。
        sendVerificationEmail(user.email, user.first_name ,url);
        return res.status(200).json({
            message: "Email verification link has been sent to your email.",
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//通过邮箱寻找用户
exports.findUser = async (req, res) => {
    try{
        const {email} = req.body;
        //通过email查询用户，"-password"排除了密码字段，意味着返回的用户对象将不包含密码信息。
        const user = await User.findOne({email}).select("-password");
        if(!user){
            return res.status(400).json({message: "Account does not exists."});
        }

        return res.status(200).json({
            email: user.email,
            picture: user.picture
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//通过邮箱发送验证码
exports.sendResetPasswordCode = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email}).select("-password");
        //删除用户之前可能存在的验证码
        await Code.findOneAndDelete({user: user._id});
        //生成验证码
        const code = generateCode(5);
        //保存验证码
        const savedCode = await new Code({
            code, 
            user: user._id,
        }).save();

        //通过email 发送验证码
        sendResetCode(user.email, user.first_name, code);
        return res.status(200).json({
            message: "Email reset code has been sent to your email",
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//输入验证码 然后进行核对
exports.validateResetCode = async (req, res) => {
    try{
        const {email, code} = req.body;
        const user = await User.findOne({email});
        const Dbcode = await Code.findOne({user: user._id});
        if(Dbcode.code != code){
            return res.status(400).json({message: "Verification code is wrong...", });
        }
        return res.status(200).json({message: "ok"});
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

//输入更改后的密码
exports.changePassword = async (req, res) => {
    try{
        const {email, password} = req.body;
        //加密密码
        const cryptedPassword = await bcrypt.hash(password, 12);
        await User.findOneAndUpdate(
            {email}, {password: cryptedPassword},
        );
        return res.status(200).json({message: "ok"});
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.getProfile = async (req, res) => {
    try{
        const {username} = req.params;
        //现在登录的用户
        const user = await User.findById(req.user.id);
        //查找的用户
        const profile = await User.findOne({username}).select("-password");

        const friendship = {
            friends: false,
            following: false,
            requestSent: false,
            requestReceived: false,
        };

        if (!profile){
            return res.json({ ok: false });
        }

        if(user.friends.includes(profile._id) && profile.friends.includes(user._id)){
            friendship.friends = true;
        } 

        if(user.following.includes(profile._id)){
            friendship.following = true;
        }

        if(user.requests.includes(profile._id)){
            friendship.requestReceived = true;
        }

        if(profile.requests.includes(user._id)){
            friendship.requestSent = true;
        }

        // 在数据库中查找该用户发布的所有帖子，并通过 populate 方法关联用户信息
        const posts = await Post.find({user: profile._id}).populate("user")
            .populate("comments.commentBy", "first_name last_name picture username commentAt")
            .sort({createdAt: -1});

        await profile.populate("friends", "first_name last_name username picture");
        // 将 profile 和 posts 合并为一个 JSON 对象，并发送给客户端
        // profile.toObject() 将 profile 对象转换为普通 JavaScript 对象，以确保不包含 Mongoose 特有的方法和属性
        res.json( {...profile.toObject(), posts, friendship});
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

exports.updateProfilePicture = async(req, res) => {
    try{
        const {url} = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            picture: url,
        })
        res.json(url);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.updateCover = async(req, res) => {
    try{
        const {url} = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            cover: url,
        })
        res.json(url);
    } catch(error)  {
        res.status(500).json({message: error.message});
    }
};

exports.updateDetails = async(req, res) => {
    try{
        const {infos} = req.body;
        const updated = await User.findByIdAndUpdate(req.user.id, {
                details: infos,
            },{
                /*  new: true : 这个选项指示 findByIdAndUpdate 返回更新后的文档，而不是默认的更新前的文档。
                这样，updated 变量将包含更新后的用户文档。*/
                new: true,
            }
        );
        res.json(updated.details);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

exports.addFriend = async(req, res) => {
    try{
        console.log(req.user.id);
        if(req.user.id !== req.params.id){
            //发送者
            const sender = await User.findById(req.user.id);
            //被添加者
            const receiver = await User.findById(req.params.id);
            // 确保被添加者的 好友请求列表和好友列表中没有 发送者
            if(!receiver.requests.includes(sender._id) && !receiver.friends.includes(sender._id)){
                // 在被添加者的好友请求列表中 添加 发送者的id
                await receiver.updateOne({ 
                    $push: { requests: sender._id},
                });
                // 在被添加者的followers列表中 添加 发送者的id
                await receiver.updateOne({ 
                    $push: { followers: sender._id},
                });
                // 在 发送者的following列表中 添加 被添加者的id
                await sender.updateOne({ 
                    $push: { following: receiver._id},
                });
                res.json({ message: "friend request has been sent" });
            } else {
                return res.status(400).json({ message: "Already sent" });
            }
        } else{
            return res.status(400).json({ message: "You can't send a request to yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.cancelRequest = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            if(receiver.requests.includes(sender._id) && !receiver.friends.includes(sender._id)){
                await receiver.updateOne({ 
                    $pull: { requests: sender._id},
                });
                await receiver.updateOne({ 
                    $pull: { followers: sender._id},
                });
                await sender.updateOne({ 
                    $pull: { following: receiver._id},
                });
                // await sender.updateOne({ 
                //     $pull: { following: sender._id},
                // });
                res.json({ message: "you successfully canceled request" });
            } else {
                return res.status(400).json({ message: "Already Canceled" });
            }
        } else{
            return res.status(400).json({ message: "You can't cancel a request to yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.follow = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            if(!receiver.followers.includes(sender._id) && !sender.following.includes(receiver._id)){
                await receiver.updateOne({
                    $push: { followers: sender._id },
                });
          
                await sender.updateOne({
                    $push: { following: receiver._id },
                });
                res.json({ message: "follow success" });
            } else {
                return res.status(400).json({ message: "Already following" });
            }
        } else{
            return res.status(400).json({ message: "You can't follow yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.unfollow = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            if(receiver.followers.includes(sender._id) && sender.following.includes(receiver._id)){
                await receiver.updateOne({
                    $pull: { followers: sender._id },
                });
          
                await sender.updateOne({
                    $pull: { following: receiver._id },
                });
                res.json({ message: "unfollow success" });
            } else {
                return res.status(400).json({ message: "Already not following" });
            }
        } else{
            return res.status(400).json({ message: "You can't unfollow yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.acceptRequest = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const receiver = await User.findById(req.user.id);
            const sender = await User.findById(req.params.id);
            if(receiver.requests.includes(sender._id)){
                await receiver.updateOne({
                    $push: { friends: sender._id},
                });
                await receiver.updateOne({
                    $push: { following: sender._id},
                })
                await receiver.updateOne({ 
                    $pull: { requests: sender._id},
                });
                await sender.updateOne({
                    $push: { friends: receiver._id,},
                });
                await sender.updateOne({
                    $push: { followers: receiver._id ,},
                });
                res.json({ message: "friend request accepted" });
            } else {
                return res.status(400).json({ message: "Already friends" });
            }
        } else{
            return res.status(400).json({ message: "You can't accept a request from yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.unfriend = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);

            if(receiver.friends.includes(sender._id) && sender.friends.includes(receiver._id)){
                await receiver.updateOne({
                    $pull: { friends: sender._id},
                });
                await receiver.updateOne({
                    $pull: { following: sender._id},
                })
                await receiver.updateOne({
                    $pull: { followers: sender._id },
                });
                await sender.updateOne({
                    $pull: { friends: receiver._id,},
                });
                await sender.updateOne({
                    $pull: { following: receiver._id},
                })
                await sender.updateOne({
                    $pull: { followers: receiver._id ,},
                });
                res.json({ message: "unfriend request accepted" });
            } else {
                return res.status(400).json({ message: "Already deleted" });
            }
        } else {
            return res.status(400).json({message: "You can't unfriend yourself"});
        }
    } catch(error){ 
        res.status(500).json({message: error.message});
    }
}

exports.deleteRequest = async(req, res) => {
    try{
        if(req.user.id !== req.params.id){
            const receiver = await User.findById(req.user.id);
            const sender = await User.findById(req.params.id);
            if(receiver.requests.includes(sender._id)){
                await receiver.updateOne({ 
                    $pull: { requests: sender._id},
                });
                await receiver.updateOne({ 
                    $pull: { followers: sender._id},
                });
                await sender.updateOne({ 
                    $pull: { following: receiver._id},
                });
                res.json({ message: "delete request accepted" });
            } else {
                return res.status(400).json({ message: "Already deleted" });
            }
        } else{
            return res.status(400).json({ message: "You can't delete yourself" });
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.search = async(req, res) => {
    try{
        const searchTerm = req.params.searchTerm;
        //$text 操作符进行文本搜索。这是 MongoDB 的全文搜索功能
        const results = await User.find({$text: {$search: searchTerm}}).select("first_name last_name username picture");
        res.json(results);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.addToSearchHistory = async(req, res) => {
    try{
        const {searchUser} = req.body;
        const search = {
            user: searchUser,
            createdAt: new Date(),
        };

        const user = await User.findById(req.user.id);
        const check = user.search.find((x) => x.user.toString() === searchUser);

        if(check){
            await User.updateOne({
                // 根据这两个去查询对饮的搜索记录,然后更新搜索日期
                _id: req.user.id,
                "search._id": check._id,
            }, {
                $set: {"search.$.createAt": new Date()}
            });
        } else {
            await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    search,
                }
            })
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.getSearchHistory = async(req, res) => {
    try{
        const results = await User.findById(req.user.id).select("search")
            .populate("search.user", "first_name last_name username picture");
        res.json(results.search);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.removeFromSearch = async(req, res) => {
    try{
        const {searchUser} = req.body;
        await User.updateOne({
            _id: req.user.id,
        }, {
            $pull: {search: {user: searchUser}}
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.getFriendsPageInfos = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select("friends requests")
            .populate("friends", "first_name last_name picture username")
            .populate("requests", "first_name last_name picture username");
        
        const sentRequests = await User.find({
            requests: new mongoose.Types.ObjectId(req.user.id),
        }).select("first_name last_name picture username");

        res.json({
            friends: user.friends,
            requests: user.requests,
            sentRequests,
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
}
