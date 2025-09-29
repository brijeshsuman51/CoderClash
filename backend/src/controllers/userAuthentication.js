const redisClient = require("../config/redisDB")
const User = require("../models/user")
const validate = require('../utils/validator')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const Register = async (req,res)=>{
    
    try{
        // validate the data;

      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'
    //
    
    const user =  await User.create(req.body);
    const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
    const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
    }
    
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user:reply,
        message:"Loggin Successfully"
    })
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const Login = async (req,res)=>{
    
    try {
        const {emailId,password} = req.body;

        if(!emailId)
            throw new Error("Invalid Email")
        if(!password)
            throw new Error("Invalid password")

        const user = await User.findOne({emailId})

        const matchpass = await bcrypt.compare(password,user.password)
        
        if(!matchpass)
            throw new Error("Invalid Password")

        const token = jwt.sign({_id:user._id,emailId:user.emailId, role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
        const reply = {
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id,
            role:user.role
        }
        res.cookie("token",token,{maxAge:60*60*1000})

        res.json({
            user:reply,
            message:"Login Successfully"
        })
    } catch (error) {
        res.send("Err2or:",error)
    }
}

const Logout = async (req,res) => {
    try {
        const {token} = req.cookies;
        const payload = jwt.decode(token)

        await redisClient.set(`token:${token}`,'Blocked')
        await redisClient.expireAt(`token:${token}`,payload.exp)

        res.cookie('token',null,{expires: new Date(Date.now())})
        res.send("User Logout Successfully")
    } catch (err) {
        res.send('Err3or:'+err)
    }
}

const adminRegister = async (req,res) => {

    try {
    validate(req.body)

    const {firstName,password,emailId} = req.body

    req.body.password = await bcrypt.hash(password,10)

    const user = await User.create(req.body)
    const token = jwt.sign({_id:user._id,emailId:user.emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
    res.cookie('token',token,{maxAge:60*60*1000})
    res.send("Admin Registered Successfully")


    } catch (error) {
        res.send('Err4or:'+error)
    }

}


const deleteProfile = async (req,res) => {
    try {
        const userId = req.result._id;

        await User.findByIdAndDelete(userId)

        res.send("Deleted Profile Successfully")
    } catch (error) {
        res.send('Erro5r:'+error)
    }
}

const checkUser = (req,res) => {
    
    const reply = {
        _id:req.result._id,
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        role:req.result.role
    }

    res.json({
        user:reply,
        message:"Valid User"
    })
}
module.exports = {Register,Login,Logout,adminRegister,deleteProfile,checkUser}
