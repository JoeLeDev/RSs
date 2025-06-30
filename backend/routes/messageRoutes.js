const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

// Envoyer un message
router.post("/", auth, messageController.sendMessage);
// Récupérer la conversation avec un utilisateur
router.get("/:userId", auth, messageController.getConversation);

module.exports = router; 