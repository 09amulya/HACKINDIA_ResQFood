const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true   // 🔥 prevents duplicate registrations
  },

  email: {
    type: String,
    lowercase: true
  },

  role: {
    type: String,
    enum: ["donor", "ngo"],
    required: true
  },

  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: String
  },

  // NGO specific
  organizationType: {
    type: String,
    default: "NGO"
  },

  capacity: {
    type: Number,
    required: true
  },

  currentLoad: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);