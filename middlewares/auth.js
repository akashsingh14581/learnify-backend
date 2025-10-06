const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth
exports.auth = async(req, res, next)=>{
    try {
        // extract token
        const token = req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ", "");

        // if token missing, then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }

          // verify token
        try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Decoded user from token:", req.user);

        } catch (error) {
            // verification issue
            return res.status(401).json({
                success:false,
                message:"Invalid or expired token"
            })
        }

       next()
        
    } catch (error) {
        console.error("error getting in token", error);
        return res.status(500).json({
            success:false,
            message:"internal server error in verify token",
            error:error.message
        })
    }
}

// isStudent
exports.isStudent = async(req, res, next)=>{
    try {
        
        if(req.user.role !== "Student"){
            return res.status(403).json({
                success:false,
                message:"This is protected route for Student Only"
            })
        }
        next()
    } catch (error) {
        console.error("Getting an error in isStudent middleware", error.message);
        return res.status(500).json({
            success:false,
            message:"internal server error in isStudent middleware",
            error:error.message
        })
    }
}

// isInstructor
exports.isInstructor = async(req, res, next)=>{
    try {
        
        if(req.user.role !== "Instructor"){
            return res.status(403).json({
                success:false,
                message:"This is protected route for Instructor Only"
            })
        }
        next()
    } catch (error) {
        console.error("Getting an error in Instructor middleware", error.message);
        return res.status(500).json({
            success:false,
            message:"internal server error in Instructor middleware",
            error:error.message
        })
    }
}

// isAdmin
exports.isAdmin = async(req, res, next)=>{
    try {
        
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success:false,
                message:"This is protected route for Admin Only"
            })
        }
        next()
    } catch (error) {
        console.error("Getting an error in Admin middleware", error.message);
        return res.status(500).json({
            success:false,
            message:"internal server error in Admin middleware",
            error:error.message
        })
    }
}