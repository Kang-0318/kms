const mongoose = require("mongoose")

const todoSchema = new mongoose.Schema(
    {
        text:{
            type:String,
            required:true,
            trim:true
        },
        isCompleted:{
            type:Boolean,
            default:false
        },
        date:{
            type:Date,
            default:Date.now
        }
    },
    {timestamps:true}
)

const Todo =mongoose.model("Todo",todoSchema)

module.exports=Todo