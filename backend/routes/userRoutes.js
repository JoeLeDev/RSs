const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

// Get user by ID
router.get("/:userId", auth, userController.getUserById);

// Update user profile
router.patch("/", auth, userController.updateUser);

module.exports = router; 