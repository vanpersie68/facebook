const React = require("../models/React");
const mongoose = require("mongoose");
const User = require("../models/user");

exports.reactPost = async (req, res) => {
    try {
        const {postId, react} = req.body;

        // 查询是否存在具有相同帖子引用和用户ID的反应记录
        const check = await React.findOne({
            postRef: postId,
            reactBy: new mongoose.Types.ObjectId(req.user.id),
        });

        // 如果没有找到相应的反应记录（check为null）
        if(check == null){
            const newReact = new React({
                react: react,
                postRef: postId,
                reactBy: req.user.id,
            });

            await newReact.save();
        } else {
            // 如果找到了相同的 React，先判断与原本的是不是同一个（因为是同一个的话，第二次点击需要删除这个表情的互动）
            if(check.react == react){
                await React.findByIdAndDelete(check._id);
            } else{
                // 不是同一个，更新
                await React.findByIdAndUpdate(check._id, {
                    react: react,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getReacts = async (req, res) => {
    try{
        // 查询具有指定帖子引用的所有反应记录
        const reactsArray = await React.find({postRef: req.params.id});

        /* 初始时，group 是一个空对象 {}。随着 reduce 函数的迭代，它会不断累积新的键值对，其中键是反应类型，值是对应类型的反应记录数组。
        react 是当前正在处理的反应记录。通过 let key = react["react"]; 获取了这个反应记录的类型，并用这个类型作为分组的键。*/
        //此处的目的是统计同一片贴子收到的不同表情，然后根据这些不同的表情进行分组
        const newReacts = reactsArray.reduce((group, react) => {
            //key获取的是 react对应的表情
            let key = react["react"];
            //创建每个表情对应的数组
            group[key] = group[key] || [];
            group[key].push(react);
            return group;
        }, {});
        
        // 统计同一片贴子 不同表情所具备的数量
        const reacts = [
            {
                react: "like",
                count: newReacts.like ? newReacts.like.length : 0,
            },
            {
                react: "love",
                count: newReacts.love ? newReacts.love.length : 0,
            },
            {
                react: "haha",
                count: newReacts.haha ? newReacts.haha.length : 0,
            },
            {
                react: "sad",
                count: newReacts.sad ? newReacts.sad.length : 0,
            },
            {
                react: "wow",
                count: newReacts.wow ? newReacts.wow.length : 0,
            },
            {
                react: "angry",
                count: newReacts.angry ? newReacts.angry.length : 0,
            },
        ];

        // 查询指定用户对特定帖子的反应记录
        const check = await React.findOne({
            postRef: req.params.id,
            reactBy: req.user.id,
        });

        const user = await User.findById(req.user.id);
        const checkSaved = user?.savedPosts.find(
            (x) => x.post.toString() === req.params.id
        );

        /*  reacts 表示一篇帖子所有的表情；
            check表示登录用户对一篇贴子发送的表情，
            totol返回的是一片贴子表情的总数量   */
        res.json({reacts, check: check?.react, total: reactsArray.length, 
            checkSaved: checkSaved ? true : false });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};