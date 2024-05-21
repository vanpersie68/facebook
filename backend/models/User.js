const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "first_name is required"], // 表明这个字段是必需的，如果没有提供 first_name，会触发一个错误，错误消息为 "first_name is required"。
        trim: true, // 在保存数据之前移除 first_name 字符串的首尾空格。
        text: true, //如果你计划在这个字段上执行全文本搜索，这个选项会启用全文本搜索索引。
    },
    last_name: {
        type: String,
        required: [true, "last_name is required"], 
        trim: true, 
        text: true,
    },
    username: {
        type: String,
        required: [true, "username is required"], 
        trim: true, 
        text: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "email is required"], 
        trim: true, 
    },
    password: {
        type: String,
        required: [true, "password is required"], 
    },
    picture: {
        type: String,
        default: "https://res.cloudinary.com/dvkre5hrd/image/upload/v1703961324/persieVan/postImages/download_x13frm.png",
    },
    cover: { //背景图片
        type: String,
        trim: true, 
    },
    gender: {
        type: String,
        required: [true, "gender is required"], 
        trim: true,
    },
    bYear: {
        type: Number,
        required: true, 
        trim: true,
    },
    bMonth: {
        type: Number,
        required: true, 
        trim: true,
    },
    bDay: {
        type: Number,
        required: true, 
        trim: true,
    },
    verified: {
        type: Boolean,
        default: false, 
    },
    friends: [
      {
        type: ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: ObjectId,
        ref: "user",
      },
    ],
    followers: [
      {
        type: ObjectId,
        ref: "user",
      },
    ],
    requests: [
      {
        type: ObjectId,
        ref: "user",
      },
    ],
    search: [
        {
            user:{
                type: ObjectId,
                ref: "user",
                required: true,
            },
            createdAt:{
              type: Date,
              required: true,
            }
        }
    ],
    details: {
        bio: {
          type: String,
        },
        otherName: {
          type: String,
        },
        job: {
          type: String,
        },
        workplace: {
          type: String,
        },
        highSchool: {
          type: String,
        },
        college: {
          type: String,
        },
        currentCity: {
          type: String,
        },
        hometown: {
          type: String,
        },
        relationship: {
          type: String,
          enum: ["Single", "In a relationship", "Married", "Divorced"],
        },
        instagram: {
          type: String,
        },
      },
      savedPosts: [
        {
          post: {
            type: ObjectId,
            ref: "Post",
          },
          savedAt: {
            type: Date,
            required: true,
          },
        },
      ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("user", userSchema);