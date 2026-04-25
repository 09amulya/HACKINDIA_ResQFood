const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  donorId: String,
  quantity: Number,
  expiryTime: Date,
  status: {
    type: String,
    default: "pending"
  },
  assignedNGO: String
});

module.exports = mongoose.model("Food", foodSchema);