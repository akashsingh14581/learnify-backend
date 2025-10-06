const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL)
       console.log("✅ mongodb connected successfully")
    } catch (error) {
        console.error("✖️ connection with DB failed", error.message);
        process.exit(1)
    }
}

module.exports = connectDB;