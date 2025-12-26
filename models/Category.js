const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: []
    }
  ]
});

module.exports = mongoose.model("Category", categorySchema);
