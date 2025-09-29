const cloudinary = require("cloudinary").v2;
const Problem = require("../models/problem")
const Video = require("../models/video")

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

const createVideo = async (req,res) => {
    try {
        const {id} = req.params;
        const userId = req.result._id;

        const problem = await Problem.findById(id)
        if(!problem){
            return res.json({error:"Problem not found"})
        }

        const timestamp = Math.round(new Date().getTime() / 1000)
        const publicId = `coderclash-solutions/${id}/${userId}_${timestamp}`

        const uploadParams = {
            timestamp:timestamp,
            public_id:publicId
        }

        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_SECRET
        )

        res.json({
            signature,
            timestamp,
            public_id:publicId,
            api_key:process.env.CLOUDINARY_KEY,
            cloud_name:process.env.CLOUDINARY_NAME,
            upload_url:`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/video/upload`
        })
    } catch (error) {
        console.error("Error for create video in cloudinary",error)
        res.json({error:'Failed to generate upload credentials'})
    }
}

const saveVideo = async (req,res) => {
    try {
        const{
            problemId,
            cloudinaryPublicId,
            secureUrl,
            duration
        } = req.body

        const userId = req.result._id;

        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type:'video'}
        )

        if(!cloudinaryResource){
            return res.json({error:'Video not found on cloudinary'})
        }

        const existingVideo = await Video.findOne({
            problemId,
            userId,
            cloudinaryPublicId
        })

        if(existingVideo){
            return res.json({error:"Video already exists"})
        }

        const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type:'video'})

        const videoSolution = await Video.create({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl,
            duration:cloudinaryResource.duration || duration,
            thumbnailUrl
        })

        res.json({
            message:"Video Solution saved Successfully",
            videoSolution:{
                id:videoSolution._id,
                thumbnailUrl:videoSolution.thumbnailUrl,
                duration:videoSolution.duration,
                uploadedAt:videoSolution.createdAt
            }
        })
    } catch (error) {
        console.error("Error saving meta data",error)
        res.json({error:'Failed to save the video solution'})
    }
}

const deleteVideo = async (req,res) => {
    try {
        const {id} = req.params;
        const userId = req.result._id;

        const video = await Video.findOneAndDelete({problemId:id})

        if(!video){
            return res.json({error:'Video not found'})
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type:'video',invalidate:true})

        res.json({message:"Video deleted Successfully"})
    } catch (error) {
        console.error('Error for deleting video:',error)
        res.json({error:"Failed to delete Video"})
    }
}



module.exports = {createVideo,saveVideo,deleteVideo}