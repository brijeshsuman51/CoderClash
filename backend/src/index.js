const express = require('express');
const app = express()
require('dotenv').config();
const main = require('./config/mongoDB')
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userRoute');
const problemRouter = require("./routes/problemRoute")
const redisClient = require('./config/redisDB');
const submitRouter = require('./routes/submissionRoute');
const cors = require("cors");
const AiRouter = require('./routes/SolverRoute');
const videoRouter = require('./routes/videoRouter');

app.use(cors({
    // console.log("Hello"),
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json())
app.use(cookieParser())

app.use('/user',authRouter)
app.use('/problem',problemRouter)
app.use('/submission',submitRouter)
app.use('/ai',AiRouter)
app.use('/video',videoRouter)

const InitializeConnection = async () => {
    try {
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected")

        app.listen(process.env.PORT,()=>{
            console.log("Server is running at Port Number:"+process.env.PORT)
        })
    } catch (error) {
        console.error("Error:",error)
    }
}

InitializeConnection()