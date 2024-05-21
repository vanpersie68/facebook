const Post = require("../models/Post");
const User = require("../models/user");

exports.createPost = async (req, res) => {
    try{
        const post = await new Post(req.body).save();
        await post.populate("user", "first_name last_name cover picture username");
        res.json(post);
    } catch (error){
        return res.status(500).json({message: error.message});
    }
};

exports.getAllPosts = async (req, res) => {
    try{
        //--------------查询follow用户创建的贴子 和 贴子的评论 ---------------------------------
        // 使用用户ID查找用户文档，并选择 "following" 字段
        const followingTemp = await User.findById(req.user.id).select("following");
        // 从查询结果中提取关注的用户数组 
        const followingUserID = followingTemp.following; //输出的是关注的用户的id
        // 创建一个Promise数组，每个Promise用于获取一个关注用户的帖子信息
        const promises = followingUserID.map((user) => {
            // 查询特定用户的帖子，并进行一系列关联查询，包括用户信息和评论信息
            return Post.find({user: user}).populate("user", "first_name last_name username cover")
                .populate("comments.commentBy", "first_name last_name picture username")
                .sort({createdAt: -1}).limit(10); //使用 Mongoose 的 sort 方法，按照 createdAt 字段降序排序，即最新的帖子排在前面。-1 表示降序，1 表示升序。
        });

        // 并行执行所有的Promise，并将结果数组扁平化 (获取的是贴子及其评论的信息)
        const followingPosts = await (await Promise.all(promises)).flat();

        //----------------查询用户自己创建的贴子 和 贴子的评论 ----------------------------------
        // 查询当前用户的帖子信息，同样进行关联查询和排序
        const userPosts = await Post.find({user: req.user.id})
            .populate("user", "first_name last_name username cover")
            .populate("comments.commentBy", "first_name last_name picture username")
            .sort({createdAt: -1}).limit(10);
        
        // 将当前用户的帖子添加到关注用户的帖子数组中
        followingPosts.push(...[...userPosts]);

        // 按照帖子的创建时间降序排序整个帖子数组
        followingPosts.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });

        res.json(followingPosts);
    } catch (error){
        return res.status(500).json({message: error.message});
    }
};

exports.comment = async(req, res) => {
    try{
        const {comment, image, postId} = req.body;
        let newComments = await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    comment: comment,
                    image: image,
                    commentBy: req.user.id,
                    commentAt: new Date(),
                },
            },
        }, {
            new: true,
        }).populate("comments.commentBy", "picture first_name last_name username");
        res.json(newComments.comments);
    } catch (error){
        return res.status(500).json({message: error.message});
    }
};

exports.savePost = async(req, res) => {
    try{
        // 从请求参数中获取帖子的ID
        const postId = req.params.id;
        // 使用用户ID查找用户文档
        const user = await User.findById(req.user.id);
        // 检查用户的 是否保存了这个贴子 
        const check = user?.savedPosts.find((post) => 
            post.post.toString() == postId
        );

        if(check){
            // 如果帖子已保存，使用 $pull 从 savePosts 数组中移除指定帖子
            await User.findByIdAndUpdate(req.user.id, {
                $pull: {
                    savedPosts: {
                        _id: check._id,
                    },
                },
            });
        } else {
            // 如果帖子未保存，使用 $push 将帖子信息添加到 savePosts 数组中
            await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    savedPosts: {
                        post: postId, 
                        savedAt: new Date(),
                    },
                },
            });
        }
    } catch(error){
        return res.status(500).json({message: error.message});
    }
};

exports.deletePost = async(req, res) => {
    try{
        await Post.findByIdAndDelete(req.params.id);
        res.json({status: "ok"});
    } catch(error){
        return res.status(500).json({message: error.message});
    }
};