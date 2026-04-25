const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
};