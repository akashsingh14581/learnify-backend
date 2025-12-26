const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
  try {
    // fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, category, tag } =
      req.body;

    // get thumbnail
    const thumbnail = req.files?.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !thumbnail ||
      !category ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "all fields required to create course",
      });
    }

    // check instructor or not
    const instructorId = req.user.id;
    const instructorDetails = await User.findById(instructorId);
    console.log("instructor details", instructorDetails);
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "instructor details not found",
      });
    }

    //check given category valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

        // ✅ check for duplicate course (same instructor + same name)
    const existingCourse = await Course.findOne({
      courseName,
      instructor: instructorDetails._id,
    });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with the same name already exists for this instructor",
      });
    }

    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an course entry
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      tag,
      status: "Draft"
    });

    //add the new course to the user schema of the instructor
    // await User.findByIdAndUpdate({id:instructorDetails._id},
    //     {
    //         $push:{
    //             courses:newCourse._id
    //         }
    //     },
    //     {new:true}
    // )

    // ya phir
    instructorDetails.courses.push(newCourse._id);
    await instructorDetails.save();

    //update the category schema
    categoryDetails.courses.push(newCourse._id);
    await categoryDetails.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("getting an error while creating a course", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in creating course",
      error: error.message,
    });
  }
};

// get all courses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: 1,
        courseDescription: 1,
        price: 1,
        thumnail: 1,
        ratingAndReviews: 1,
        studentsEnrolled: 1,
        instructor: 1,
      }
    )
      .populate("instructor", "firstName lastName email")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.error("can not fetch all courses", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in fetching all courses",
      error: error.message,
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "course id is required",
      });
    }

    // find course Details
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
          model: "Profile",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
          model: "SubSection",
        },
      })
      .exec();
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "course not found",
      });
    }

    return res.status(200).json({
      success:true,
      message:"course details fetched successfully",
      data:courseDetails
    })
    
  } catch (error) {
    console.log("getting an error while fetching course details", error);
    return res.status(500).json({
      success: false,
      message: "getting an error while fetching course details",
      error: error.message,
    });
  }
};

