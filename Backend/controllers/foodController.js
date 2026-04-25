const Food = require("../models/Food");
const { matchNGO } = require("../utils/matching");

exports.addFood = async (req, res) => {
  const food = await Food.create(req.body);

  const ngo = await matchNGO(food);

  if (ngo) {
    food.assignedNGO = ngo._id;
    food.status = "notified";
    await food.save();
  }

  res.json({ food, ngo });
};