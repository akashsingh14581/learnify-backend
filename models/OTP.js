const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
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
      emailTemplate(otp)
    );
    console.log("Email sent successfully::", mailResponse.response);
  } catch (error) {
    console.error("Error sending email:", error);
     throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
    }
      next();
  } catch (error) {
    next(error) // prevent save if email fails
  }
  
});

module.exports = mongoose.model("Otp", OTPSchema);
