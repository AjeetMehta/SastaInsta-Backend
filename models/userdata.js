var mongoose = require("mongoose");

var user = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Cant be blank"],
  },
  email: {
    type: String,
    required: [true, "Cant be blank"],
  },
  password: {
    type: String,
    required: [true, "Cant be blank"],
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  follower: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "people",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "people",
    },
  ],
  photo: {
    type: String,
    default:
      "https://i.pinimg.com/736x/ea/69/dc/ea69dc6226e72a33f82d3add20b470df.jpg",
  },
});

people = mongoose.model("people", user);

module.exports = people;
