const express = require("express");
const authRouter = express.Router();
const {Register,Login,Logout,deleteProfile,checkUser,getUserProfile,updateUserProfile} = require("../controllers/userAuthentication");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");



authRouter.post("/register",Register)
authRouter.post("/login",Login)
authRouter.post("/logout",userMiddleware,Logout)
// authRouter.post("/admin/register",adminMiddleware,adminRegister)
authRouter.post("/deleteProfile/:id",userMiddleware,deleteProfile)
authRouter.get("/check",userMiddleware,checkUser)
authRouter.get("/profile",userMiddleware,getUserProfile)
authRouter.put("/profile",userMiddleware,updateUserProfile)


module.exports = authRouter;