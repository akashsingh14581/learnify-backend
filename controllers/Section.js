const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, courseId } = req.body;

    // validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "section field required",
      });
    }

    // check course exist related with courseId
    const CourseDetails = await Course.findById(courseId).populate("courseContent");;
    if (!CourseDetails) {
      return res.status(404).json({
        success: false,
        message: "no course found related with course id",
      });
    }

    // Check for duplicate section name inside the same course
    const duplicateSection = CourseDetails.courseContent.find(
      (section) =>
        section.sectionName.toLowerCase() === sectionName.toLowerCase()
    );

       if (duplicateSection) {
      return res.status(400).json({
        success: false,
        message: "Section with this name already exists in the course",
      });
    }

    // create section
    const newSection = await Section.create({ sectionName: sectionName.trim() });


    //updated the course with section object id
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent", // sections
      populate: { path: "subSections" }, // subsections of each section
    });

    // ya phir
    // push new section into course's courseContent array
    // CourseDetails.courseContent.push(newSection._id);
    // await CourseDetails.save();

    return res.status(201).json({
      success: true,
      message: "Section created and course updated successfully",
      data: {
        section: newSection,
        course: updatedCourse,
      },
    });
  } catch (error) {
    console.error("getting an error in created Section", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in created section",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // fetch data from body
    const { sectionId, sectionName } = req.body;

    // validation
    if (!sectionId) {
      return res.status(404).json({
        success: false,
        message: "section id not get",
      });
    }
    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: "section name missing",
      });
    }

    // update section
    const updateSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    if (!updateSection) {
      return res.status(404).json({
        success: false,
        message: "section not found",
      });
    }

    return res.status(200).json({
      success: false,
      message: "section updated successfully",
      data: updateSection,
    });
  } catch (error) {
    console.error("getting an error in update Section", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in update section",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //fetch id
    const { sectionId } = req.params;

    const deletedSection = await Section.findByIdAndDelete(sectionId);

    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "not not found for deleted",
      });
    }

    // deleted section id in the course collection also
    await Course.deleteMany(
      { courseContent: sectionId },
      {
        $pull: {
          courseContent: sectionId,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "section deleted successfully",
    });
  } catch (error) {
    console.error("getting an error in delete Section", error);
    return res.status(500).json({
      success: false,
      message: "internal server error in delete section",
      error: error.message,
    });
  }
};
