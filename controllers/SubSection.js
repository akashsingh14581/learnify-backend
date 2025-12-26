const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    // fetch data
    const { sectionId, title, timeDuration, description } = req.body;

    // extract file/video
    const video = req.files.videoUrl;

    // validation
    if (!title || !timeDuration || !description || !video || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "all fields require to create subsection",
      });
    }

    //video upload to cloudinary
    const uploadVideoDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // 4️⃣ Check if section exists
    const sectionDetails = await Section.findById(sectionId).populate('subSections');
    if (!sectionDetails) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // 6️⃣ Check for duplicate subsection by title
    const isDuplicate = sectionDetails.subSections.some(
      (sub) => sub.title === title
    );
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: "SubSection with this title already exists in this section",
      });
    }

    // 6️⃣ Create SubSection
    const newSubSection = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadVideoDetails.secure_url,
    });

    //  7️⃣ Push new subsection into section
    // sectionDetails.subSections.push(newSubSection._id);
    // await sectionDetails.save();

    // 8️⃣ Push new subsection into section using $addToSet to avoid duplicates
    const updateSection = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { subSections: newSubSection._id } },
      { new: true }
    ).populate("subSections");

    // 8️⃣ Response
    return res.status(201).json({
      success: true,
      message: "SubSection created and added to section successfully",
      data: {
        subSection: newSubSection,
        section: updateSection,
      },
    });
  } catch (error) {
    console.error("Error in createSubSection:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in creating subsection",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
