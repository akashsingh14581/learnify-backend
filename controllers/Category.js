const Category = require("../models/Category");
const Course = require("../models/Course");
exports.createCategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;

    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "name and description are required",
      });
    }

    // entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    // send response
    return res.status(201).json({
      success: true,
      message: "category created successfully",
      category: categoryDetails,
    });
  } catch (error) {
    console.error("error in created category", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in created category",
      error: error.message,
    });
  }
};

// get all Category
exports.showAllCategories = async (req, res) => {
  try {
    // const allCategory = await Category.find({}, {name:true, description:true});
    const allCategory = await Category.find(
      {},
      { name: 1, description: 1, _id: 0 }
    ); // true or 1 mtlb same hi hota h, or _id:0 mtlb ye field exclude kr do
    return res.status(200).json({
      success: true,
      message: "all categories returned successfully",
      allCategory: allCategory,
    });
  } catch (error) {
    console.error("error in show all categories", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in show all categories",
      error: error.message,
    });
  }
};

// category page details completed but add one more feature top 10 selling course should be shows if no category matched any courses
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // 1️⃣ Find the selected category and its published courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 2️⃣ If category has no courses → show top 10 sold courses instead
    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      const topCourses = await Course.aggregate([
        { $match: { status: "Published" } },
        { $addFields: { totalStudents: { $size: "$studentsEnrolled" } } },
        { $sort: { totalStudents: -1 } },
        { $limit: 10 },
      ]);

      const populatedCourses = await Course.populate(topCourses, {
        path: "instructor",
        select: "firstName lastName",
      });

      return res.status(200).json({
        success: true,
        message:
          "No courses found in this category, showing top 10 best-selling courses instead",
        categoryCourses: [],
        topSellingCourses: populatedCourses,
      });
    }

    // 3️⃣ Otherwise return category courses normally
    return res.status(200).json({
      success: true,
      message: "Category page details fetched successfully",
      categoryCourses: selectedCategory.courses,
    });
  } catch (error) {
    console.error("Error fetching category page details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching category details",
      error: error.message,
    });
  }
};
