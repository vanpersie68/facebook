const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const reactSchema = mongoose.Schema({
    react: {
        type: String,
        enum: ["like", "love", "haha", "sad", "angry", "wow"],
        required: true,
    },
    postRef: {
        type: ObjectId,
        ref: "Post",
    },
    reactBy: {
        type: ObjectId,
        ref: "user",
    }
});

module.exports = mongoose.model("React", reactSchema);