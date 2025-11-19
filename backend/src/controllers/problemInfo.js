const  problemStatus  = require("../utils/problemstatus")
const Problem = require("../models/problem")
const Submit = require("../models/submit")
const User = require("../models/user")
const Video = require("../models/video")

// Create Problem 

const createProblem = async (req,res) => {
    try {
        await problemStatus(req.body)
        const problemInfo = await Problem.create({
            ...req.body,
            problemCreator : req.result._id,
        })
        res.status(201).json({ message: "Problem Created Successfully", problem: problemInfo });
        // res.send("Problem Created Successfully")
    } catch (error) {
            // console.log("Hello1")

        // console.error("Error:",error)
        console.error("Error creating problem:", error.message);
        res.status(400).json({ message: "Failed to create problem.", error: error.message });
        // res.send(error)
    }
}

// Update Problem 

const updateProblem = async (req,res) => {
    try {
        // console.log("Hello")
        const {id} = req.params;

        if(!id)
            return res.send("Missing ID Fields")

        const DSAProblem = await Problem.findById(id)
        if(!DSAProblem){
            return res.send("ID is not present")
        }

        problemStatus(req.body)

        const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
        res.send(newProblem)
        
    } catch (error) {
        res.send("Error3423:"+error.message)
    }
    
}

// Delete Problem 

const deleteProblem = async (req,res) => {
    
    const { id } = req.params;

    try {
        if(!id){
            return res.send("ID is Missing")
        }

        const deletedProblem = await Problem.findByIdAndDelete(id)

        if(!deletedProblem){
            return res.send("Problem is Missing")
        }
        res.send("Problem Deleted Successfully")
    } catch (error) {
        res.send("Error:",error)
    }
}

// Problem Fetch By User

const getProblemByUsers = async (req,res) => {
    const {id} = req.params
    try {
        if(!id){
            return res.send("Id is not present")
        }
        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ')

        if(!getProblem){
            return res.send("Problem is missing")
        }

        const videos = await Video.findOne({problemId:id})

        if(videos){
            const response = {
                ...getProblem.toObject(),
                secureUrl:videos.secureUrl,
                thumbnailUrl:videos.thumbnailUrl,
                duration:videos.duration
            }
            return res.send(response)
        }

        res.send(getProblem)
    } catch (error) {
        res.send("Error:",error)
    }
    
}

// All Problem Fetch 
const getAllProblem = async (req,res) => {
    try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags')
        if(getProblem.length==0){
            return res.send("Problems is Missing")
        }

        res.send(getProblem)
    } catch (error) {
        res.send("Error:"+error)
    }
}

// Solved Problems By User 

const solvedAllProblemByUser = async (req,res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:'problemSolved',
            select:'_id title difficulty tags'
        })
        res.send(user.problemSolved)
    } catch (error) {
        res.send("Error:",error)
    }
}

// Submissions 

const submittedProblem = async (req,res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        const ans = await Submit.find({userId,problemId})
        if(ans.length==0)
            res.send("No Submission is present")
        res.send(ans)
    } catch (error) {
        res.send("Error:",error)
    }
}


module.exports = {createProblem,updateProblem,deleteProblem,getProblemByUsers,getAllProblem,solvedAllProblemByUser,submittedProblem}
