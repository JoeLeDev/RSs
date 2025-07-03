const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // destinataire
  type: { type: String, enum: ["message", "reaction", "friend_request", "group_invite", "friend_accept"], required: true },
  content: { type: String }, // texte ou résumé
  link: { type: String }, // URL à ouvrir au clic
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema); 