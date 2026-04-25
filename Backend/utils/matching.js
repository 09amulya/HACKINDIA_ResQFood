const User = require("../models/User");

exports.matchNGO = async (food) => {
  const ngos = await User.find({ role: "ngo", isActive: true });

  if (!ngos.length) return null;

  return ngos[0]; // simplest MVP
};