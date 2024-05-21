const express = require("express");
const { uploadImages, listImages } = require("../controllers/upload");
const imageUpload = require("../middlewares/imageUpload");
const {authUser} = require("../middlewares/auth")

const router = express.Router();

//在上传图片前，通过imageUpload对图片进行验证，确保图片能够显示
router.post("/uploadImages", authUser, imageUpload, uploadImages);
router.post("/listImages", authUser, listImages);

module.exports = router;
