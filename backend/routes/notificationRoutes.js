const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middlewares/authMiddleware");

// Récupérer les notifications
router.get("/", auth, notificationController.getNotifications);
// Marquer une notification comme lue
router.patch("/:id/read", auth, notificationController.markAsRead);
// Marquer toutes les notifications comme lues
router.patch('/mark-all-read', auth, notificationController.markAllAsRead);

module.exports = router; 