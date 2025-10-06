const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: [true, "OTP value is required"],
     match: [/^\d{6}$/, "OTP must be 6 digits"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

// function to send email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "verification email from Studynotion ",
      `Your OTP is ${otp}`
    );
    console.log("Email sent:", mailResponse);
  } catch (error) {
    console.error("Error sending email:", error);
     throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  try {
    await sendVerificationEmail(this.email, this.otp);
  next();
  } catch (error) {
    next(error) // prevent save if email fails
  }
  
});

module.exports = mongoose.model("Otp", OTPSchema);
