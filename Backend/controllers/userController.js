const User = require("../models/User");
const { matchNGO } = require("../utils/matching");


exports.testMatching = async (req, res) => {
  try {
    const food = req.body;

    const result = await matchNGO(food);

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { phone } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "NGO already registered" });
    }

    const user = await User.create(req.body);
    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: "ngo" });
    res.status(200).json(ngos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};