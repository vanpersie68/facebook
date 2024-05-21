const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const codeSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
        ref: "user",
        required: true,
    },
});

module.exports = mongoose.model("Code", codeSchema);