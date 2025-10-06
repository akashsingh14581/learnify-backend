const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required: [true, "Description is required"],
        trim:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true,
        default:[]
    }
});

module.exports = mongoose.model("Tag", tagSchema);
