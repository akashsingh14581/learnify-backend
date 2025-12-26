// create rating
const mongoose = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

exports.createRating = async (req, res) => {
  try {
    // 1️⃣ User ID from token (middleware se)
    const userId = req.user.id;

    // 2️⃣ Data from body
    const { courseId, rating, review } = req.body;

    // 3️⃣ Validation
    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields (courseId, rating, review) are required",
      });
    }

    // 4️⃣ Check if course exists
    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 5️⃣ Check if user is enrolled in this course
    const isEnrolled = courseDetails.studentsEnrolled.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "User is not enrolled in this course, cannot give rating",
      });
    }

    // 6️⃣ Check if user already reviewed
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // 7️⃣ Create rating & review
    const newRating = await RatingAndReview.create({
      user: userId,
      rating,
      review,
      course: courseId,
    });

    // 8️⃣ Push rating ID into course model
    await Course.findByIdAndUpdate(courseId, {
      $push: { ratingAndReviews: newRating._id },
    });

    // 9️⃣ Return success response
    return res.status(201).json({
      success: true,
      message: "Rating and review added successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("❌ Error while creating rating:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating rating",
      error: error.message,
    });
  }
};

// get average rating
exports.getAverageRating = async (req, res) => {
  try {
    // fetch course id
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "course id is required",
      });
    }

    // aggregate pipeline to calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: {
          _id: courseId,
          averageRating: { $avg: "$rating" },
          totalReview: { $sum: 1 },
        },
      },
    ]);

    // check if data not found
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No ratings yet for this course",
        averageRating: 0,
        totalReview: 0,
      });
    }

    // 🏁 Step 4: Send success response
    return res.status(200).json({
      success: true,
      message: "Average rating fetched successfully",
      averageRating: result[0].averageRating,
      totalReviews: result[0].totalReviews,
    });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

exports.allRatingReviews = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({ path: "User", select: "firstName lastName email" })
      .populate({ path: "course", select: "courseName" })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All ratings and reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ratings and reviews",
      error: error.message,
    });
  }
};
