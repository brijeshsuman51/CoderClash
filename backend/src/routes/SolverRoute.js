const express = require('express')
const AiRouter = express.Router()
const userMiddleware = require('../middleware/userMiddleware')
const AiSolver = require('../controllers/AiSolver')

AiRouter.post('/chatBot',userMiddleware,AiSolver)

module.exports = AiRouter