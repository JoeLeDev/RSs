const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

// Get user profile (me)
router.get('/me', auth, userController.getMe);

// Get user by ID
router.get("/:userId", auth, userController.getUserById);

// Update user profile
router.patch("/", auth, userController.updateUser);

// Get all users (contacts)
router.get("/", auth, userController.getAllUsers);

// Système d'amis
router.post('/friends/request', auth, userController.sendFriendRequest);
router.post('/friends/accept', auth, userController.acceptFriendRequest);
router.post('/friends/reject', auth, userController.rejectFriendRequest);
router.post('/friends/cancel', auth, userController.cancelFriendRequest);
router.post('/friends/remove', auth, userController.removeFriend);
router.get('/friends', auth, userController.getFriends);
router.get('/friends/requests', auth, userController.getFriendRequests);

module.exports = router; 