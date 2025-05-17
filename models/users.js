const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email : {
        type :String,
        required :true,
        unique : true, // عدم تكرار الايميل
        trim : true // عشان ما يكون في فراغات اول واخر الايميل
    },
    username : {
        type :String,
        // required :true, 
        trim : true 
    },
    password : {
         type :String,
        required :true, 
        trim : true ,
        minLength : 6
    },
    isAdmin :{
        type : Boolean,
        default : false
    },
},{
        timestamps:true
    })


    const user = mongoose.model("user", userSchema);
    module.exports = user;