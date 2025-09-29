const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    age:{
        type:Number,
        min:6,
        max:80
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        immutable:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
            // unique:true
        }]

    }
},{timestamps:true})

userSchema.post('findOneAndDelete',async function (userInfo) {
    if(userInfo){
        await mongoose.model('submit').deleteMany({userId:userInfo._id})
    }
})

const User = mongoose.model('user',userSchema)

module.exports = User;