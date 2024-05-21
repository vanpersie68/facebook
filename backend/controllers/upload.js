const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadImages = async (req, res) => {
    try {
        //从请求的 body 中解构出 path 属性，表示图像上传到 Cloudinary 的路径。
        const { path } = req.body;
        // 从请求的 files 对象中获取所有上传的文件，并使用 flat() 方法将嵌套的数组展平。
        let files = Object.values(req.files).flat();
        //创建一个空数组，用于存储上传成功后的图像 URL。
        let images = [];
        for (const file of files) {
            //调用 uploadToCloudinary 函数上传文件到 Cloudinary，获得上传成功后的 URL。
            const url = await uploadToCloudinary(file, path);
            //将成功上传的图像 URL 添加到 images 数组。
            images.push(url);
            removeTmp(file.tempFilePath);
        }
        res.json(images);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const uploadToCloudinary = async (file, path) => {
    //返回一个 Promise 对象，用于处理异步操作。
    return new Promise((resolve) => {
        //使用 Cloudinary 的上传器上传文件。
        cloudinary.v2.uploader.upload(
            file.tempFilePath,{ 
                //指定要上传的文件路径和 Cloudinary 中的文件夹路径。
                folder: path, 
            },(err, res) => {
                if (err) {
                    removeTmp(file.tempFilePath);
                    return res.status(400).json({ message: "Upload image failed." });
                }
                //如果上传成功，通过 Promise 的 resolve 方法返回包含上传成功后的 URL 的对象。
                resolve({
                    url: res.secure_url,
                });
            }
        );
    });
};

const removeTmp = (path) => {
    // 使用fs.unlink方法删除指定路径的文件
    fs.unlink(path, (err) => {
        if (err) throw err;
    });
};

exports.listImages = async (req, res) => {
    const {path, sort, max} = req.body;

    cloudinary.v2.search.expression(`${path}`) //创建一个搜索表达式，其中 ${path} 是搜索路径。
        .sort_by("created_at", `${sort}`) //根据创建时间排序，
        .max_results(max) //限制返回结果的最大数量
        .execute() //执行搜索操作
        .then((result) => {res.json(result)})
        .catch((error) => {console.log(error.error.message)});
};