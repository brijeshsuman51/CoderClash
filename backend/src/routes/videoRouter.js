const express = require('express')
const adminMiddleware = require('../middleware/adminMiddleware')
const videoRouter = express.Router()
const {createVideo,saveVideo,deleteVideo} = require('../controllers/VideoController')


videoRouter.get('/create/:id',adminMiddleware,createVideo)
videoRouter.post('/save',adminMiddleware,saveVideo)
videoRouter.delete('/delete/:id',adminMiddleware,deleteVideo)



module.exports = videoRouter