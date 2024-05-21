const express = require('express');
const cors = require('cors');
//这一行引入了dotenv模块，使你能够在Node.js应用程序中使用它。
const dotenv = require("dotenv"); 
const {readdirSync} = require("fs");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({
    //useTempFiles选项表示上传的文件将存储在操作系统的临时目录中。这在处理大文件时很有用，可以避免内存不足的问题。
    useTempFiles: true, 
}))

//这个方法会读取项目根目录下的.env文件，并将其中的键值对添加到process.env对象中。
dotenv.config();

//routes
readdirSync("./routes").map((result) => {
    app.use("/", require("./routes/" + result));
});

console.log(process.env.DATABASE_URL);
//database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log(`Failed to connect mongoDB, because ${err}`));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening server is ${PORT}`);
});