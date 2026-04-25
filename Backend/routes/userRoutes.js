const express = require("express");
const router = express.Router();
const {
  registerUser,
  getNGOs,
  testMatching
} = require("../controllers/userController");


router.post("/register", registerUser);
router.get("/ngos", getNGOs);
router.post("/match", testMatching);

module.exports = router;