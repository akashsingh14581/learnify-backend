const mongoose = require("mongoose");
const crypto = require("crypto");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
require("dotenv").config();

// 1️⃣ Capture payment and create Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Prevent instructor self-enrollment
    if (course.instructor.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Instructor cannot purchase their own course",
      });
    }

    // Check if already enrolled
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "User already enrolled in this course",
      });
    }

    // Create Razorpay order
    const amount = course.price * 100; // paise
    const currency = "INR";
    const options = {
      amount,
      currency,
      receipt: Math.random().toString(36).substring(2),
      notes: {
        courseId,
        userId,
      },
    };

    const order = await instance.orders.create(options);
    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Razorpay order creation failed",
      });
    }

    // Success response to frontend
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      order,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating Razorpay order",
      error: error.message,
    });
  }
};

// 2️⃣ Verify payment signature (Razorpay webhook)
exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET || "123456789";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature – Payment not verified",
      });
    }

    console.log("✅ Payment verified successfully");

    const { userId, courseId } =
      req.body?.payload?.payment?.entity?.notes || {};

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or courseId in webhook data",
      });
    }

    // Enroll student in course
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnrolled: userId } }, // avoid duplicates
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found while enrolling student",
      });
    }

    // Add course to user's enrolled list
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { courses: courseId } },
      { new: true }
    );

    if (!enrolledStudent) {
      return res.status(404).json({
        success: false,
        message: "User not found while enrolling course",
      });
    }

    // Send enrollment confirmation email
    await mailSender(
      enrolledStudent.email,
      "Course Enrollment Successful",
      courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
    );

    console.log(`📩 Enrollment email sent to ${enrolledStudent.email}`);

    return res.status(200).json({
      success: true,
      message: "Payment verified & course enrollment successful",
    });
  } catch (error) {
    console.error("Webhook verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying Razorpay signature",
      error: error.message,
    });
  }
};
