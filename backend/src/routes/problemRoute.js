const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const {createProblem,updateProblem,deleteProblem,getProblemByUsers,getAllProblem,solvedAllProblemByUser,submittedProblem} = require("../controllers/problemInfo")
const userMiddleware = require("../middleware/userMiddleware")


problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem)
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem)


problemRouter.get("/problemById/:id",userMiddleware,getProblemByUsers)
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem)
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser)

problemRouter.get("/totalProblemSubmitted/:id",userMiddleware,submittedProblem)


module.exports = problemRouter;