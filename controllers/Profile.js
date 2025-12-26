const User = require("../models/User");
const Profile = require("../models/Profile");
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    //get user id
    const userId = req.user.id;

    //validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "invalid user id",
      });
    }
    if (!contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "contact number, gender is required",
      });
    }

    //find profile
    const existingUser = await User.findById(userId);
    const profileId = existingUser.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;
    profileDetails.about = about;

    //save in db
    await profileDetails.save();
    //success response
    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      profileDetails,
    });
  } catch (error) {
    console.error("error fetching in update Profile", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "internal server error in updating profile",
    });
  }
};

// delete account hw- learn cron-job for scheduling
exports.deleteAccount = async (req, res) => {
  try {
    //find userid
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    // delete profile
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // delete user
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("getting an error while deleting account", error);
    return res.status(500).json({
      success: false,
      message: "getting an error in deleting account",
      error: error.message,
    });
  }
};

// get all users
exports.getAllUserDetails = async(req, res)=>{
  try {
    // fetch data
    const userId = req.user.id;

    //validation and get user detail
    const userDetails = await User.findById(userId).populate("additionalDetails").exec();

    if(!userDetails){
      return res.status(404).json({
        success:false,
        message:"user not found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"getching user details is successful",
      userDetails
    })

  } catch (error) {
    console.error("getting an error while finding user Details", error);
    return res.status(500).json({
      success:false,
      message:"internal server error in getting all user details",
      error:error.message
    })
  }
}


// for checking pending
exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// new added by codehelp code paste
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { imageUrl: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};


exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};