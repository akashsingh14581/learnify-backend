const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// send OTP
exports.sendOtp = async (req, res) => {
  try {
    // fetch email
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // generate OTP
    let otpNumber = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Your OTP is:", otpNumber);

    // ensure OTP is unique (optional)
    let existingOtp = await OTP.findOne({ otp: otpNumber });
    while (existingOtp) {
      otpNumber = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ otp: otpNumber });
    }

    // create OTP payload
    const otpPayload = {
      email,
      otp: otpNumber,
    };

    // save OTP in DB
    await OTP.create(otpPayload);

    // success response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otpNumber, // ❗for testing only, remove in production
    });
  } catch (error) {
    console.error("Error while sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while sending OTP",
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    //fetch data
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // 2️⃣ Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // 3️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // find most recent otp
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    }
    console.log("recent otp is", recentOtp.otp);
    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "otp not matched",
      });
    }

    // ✅ 3️⃣ Delete OTP after successful verification
    await OTP.deleteOne({ email: email, otp: recentOtp.otp });
    // hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      imageUrl: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      newUser,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  }
};

exports.login = async(req, res)=>{
  try {
    
    // fetch data
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"email and password required"
      })
    }

    // check user exist or not
    const existingUser = await User.findOne({email}).select("+password").populate("additionalDetails");
    if(!existingUser){
      return res.status(401).json({
        success:false,
        message:"User Not Found"
      })
    }

    // compare password
    const isMatchPassword = await bcrypt.compare(password, existingUser.password);
    if(!isMatchPassword){
      return res.status(401).json({
        success:false,
        message:"Password not matched"
      })
    }

    const payload = {
      email:existingUser.email,
      id:existingUser._id,
      role:existingUser.accountType
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn:"2h"
    })

    existingUser.password = undefined;

    // create cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly:true
    }
    return res.cookie("token",token, options).status(200).json({
      success:true,
      message:"logged in successful",
      token,
      existingUser
    })

  } catch (error) {
    console.error("getting an error while logged in", error);
    return res.status(500).json({
      success:false,
      message:"internal server error"
    })
  }
}

// change password
exports.changePassword = async(req, res)=>{
  try {
    // fetch data
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
      return res.status(400).json({
        success:false,
        message:"all fields are required"
      })
    }

    // newpassword !== confirmpassword
    if(newPassword !== confirmPassword){
      return res.status(400).json({
        success:false,
        message:"password not matched"
      })
    }

    //check old password match in exist password
    const existingUser = await User.findById(req.user.id).select("+password");
    if(!existingUser){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

     const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
      if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // hash password
    existingUser.password = await bcrypt.hash(newPassword, 10);

    // save in db
    await existingUser.save();

     // ✅ send email notification
    const emailBody = `
      <h2>Password Changed Successfully</h2>
      <p>Hello ${existingUser.firstName},</p>
      <p>Your account password was changed successfully.</p>
      <p>If this wasn't you, please contact support immediately!</p>
    `;
    await mailSender(existingUser.email, "Password Changed | StudyNotion", emailBody);

     return res.status(200).json({
      success: true,
      message:"Password changed successfully, confirmation email sent",
    });
  } catch (error) {
    console.error("Error while changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  
  }
}

