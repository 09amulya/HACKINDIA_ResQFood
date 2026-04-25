const User = require("../models/User");

// -----------------------------
// Utility
// -----------------------------
function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

// -----------------------------
// Core Algorithm
// -----------------------------
function calculateFoodLifeScore(food, ngo) {
  const now = Date.now();
  const timeLeft = new Date(food.expiryTime).getTime() - now;

  const MAX_SHELF_LIFE = 6 * 60 * 60 * 1000; // 6 hrs
  const DISTRIBUTION_BUFFER = 30 * 60 * 1000; // 30 min

  // ❌ Reject if NGO can't reach in time
  if (ngo.travelTime + DISTRIBUTION_BUFFER >= timeLeft) {
    return null;
  }

  const effectiveTime = timeLeft - DISTRIBUTION_BUFFER;

  // 🍛 Urgency
  let urgencyScore = (1 - timeLeft / MAX_SHELF_LIFE) * 100;
  urgencyScore = clamp(urgencyScore);

  // 📍 Distance
  let distanceScore = (1 - ngo.travelTime / effectiveTime) * 100;
  distanceScore = clamp(distanceScore);

  // 🧩 Capacity
  const capacityLeft = ngo.capacity - (ngo.currentLoad || 0);
  let capacityScore = (capacityLeft / food.quantity) * 100;
  capacityScore = clamp(capacityScore);

  // 🧮 Final Score
  const finalScore =
    0.5 * urgencyScore +
    0.3 * distanceScore +
    0.2 * capacityScore;

  return {
    name: ngo.name,
    urgencyScore,
    distanceScore,
    capacityScore,
    finalScore
  };
}

// -----------------------------
// Main Matching Function
// -----------------------------
exports.matchNGO = async (food) => {
  const ngos = await User.find({ role: "ngo", isActive: true });

  if (!ngos.length) return null;

  // 🔥 TEMP: add fake travelTime (we'll replace later)
  const enriched = ngos.map(ngo => ({
    ...ngo.toObject(),
    travelTime: Math.random() * 90 * 60 * 1000 // 0–90 mins
  }));

  const results = enriched
    .map(ngo => calculateFoodLifeScore(food, ngo))
    .filter(r => r !== null)
    .sort((a, b) => b.finalScore - a.finalScore);

  return results;
};