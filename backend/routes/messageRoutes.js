const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

// Envoyer un message
router.post("/", auth, messageController.sendMessage);
// Récupérer la conversation avec un utilisateur
router.get("/:userId", auth, messageController.getConversation);
// Récupérer tous les messages de l'utilisateur connecté
router.get("/all", auth, messageController.getAllUserMessages);

module.exports = router; 