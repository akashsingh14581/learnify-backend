require('dotenv').config();
const express = require('express');
const app = express();
// import routes
const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payment');
const courseRoutes = require('./routes/Course');


const dataBase = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 3000;

// database connect
dataBase();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:'http://localhost:3000',
        credentials:true
    })
)

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// ✅ Call the Cloudinary connection function
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);



// default route
app.get("/", (req, res)=>{
    return res.json({
        success:true,
        message:"your server is up and running out"
    })
})


app.listen(PORT, ()=>{
    console.log("app is running on", PORT)
})