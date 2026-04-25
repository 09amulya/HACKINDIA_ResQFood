const User = require("../models/User");

// -----------------------------
// Utility
// -----------------------------
function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth radius in km

  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) *
    Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
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
  const enriched = ngos.map(ngo => {
  const distanceKm = calculateDistance(food.location, ngo.location);

  // assume avg speed = 40 km/h
  const travelTime = (distanceKm / 40) * 60 * 60 * 1000;

    return {
      ...ngo.toObject(),
      travelTime,
      distanceKm
    };
  });
};