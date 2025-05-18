import mongoose from "mongoose";

const barSchema= new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    name:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    openingHours:{
        type:String,
        required:true
    },
     description:{
        type:String,
        required:true
    },
     location:{
        type:String,
        required:true
    },
    imageUrl: { type: String, required: true },
    lastUpdated:{type:Date,required:true},
     capacity:    { type: Number, required: true, default: 20 },
})

const Bar=  mongoose.model('Bar',barSchema)

export default Bar