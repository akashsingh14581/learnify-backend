require('dotenv').config();
const cloudinary = require('cloudinary').v2;


exports.cloudinaryConnect = ()=>{
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_SECRET_KEY
        })
    } catch (error) {
        console.error("getting an error in cloudinary setup", error)
    }
}