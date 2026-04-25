const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: String, // donor or ngo
  location: {
    lat: Number,
    lng: Number
  },
  capacity: Number,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("User", userSchema);