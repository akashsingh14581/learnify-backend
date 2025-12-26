const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");

// reset password || frgot password

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "email required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "email not exist",
      });
    }
    // 1️⃣ Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    const updateDetail = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpire: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    // 3️⃣ Create reset URL
    const resetUrl = `http://localhost:3000/update-password/${token}`;

    // 4️⃣ Send email
    const emailBody = `
      <h2>Password Reset Request</h2>
      <p>Hello ${existingUser.firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link is valid for 5 minutes.</p>
    `;
    await mailSender(
      existingUser.email,
      "Password Reset | StudyNotion",
      emailBody
    );

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error in resetPasswordToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    // fetch data
    const { token, password, confirmPassword } = req.body;

    // validate
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    // check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password not match, please fill carefully",
      });
    }

    // find user by token
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "invalid or expire token",
      });
    }

    // check if token expired
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired. Please try again.",
      });
    }

    // 5️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Update user password and clear token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 7️⃣ Send response
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
