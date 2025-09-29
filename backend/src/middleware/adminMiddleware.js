const jwt = require('jsonwebtoken')
const User = require('../models/user')
const redisClient = require('../config/redisDB')

const adminMiddleware = async (req,res,next) => {
    
    try {
    const {token} = req.cookies;
        
    if(!token)
        throw new Error("Invalid Credentials")

    const payload = jwt.verify(token,process.env.JWT_KEY)

    const {_id} = payload;

    if(!_id)
        throw new Error("Invalid Credentials")

    const result = await User.findById(_id)

    if(!result)
        throw new Error("User doesn`t found")

    if(payload.role!='admin')
        throw new Error('Please Registered By Admin')

    const IsBlocked = await redisClient.exists(`token:${token}`)

    if(IsBlocked)
        throw new Error("Invalid token")

    req.result = result;
    

    next()
    
        
    } catch (error) {
        res.send("Error:",error)
    }
}

module.exports = adminMiddleware