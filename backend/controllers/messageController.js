const Message = require("../models/Message");

// Envoyer un message
exports.sendMessage = async (req, res) => {
  const { recipient, content } = req.body;
  const sender = req.user._id;
  if (!recipient || !content) return res.status(400).json({ message: "Données manquantes" });
  try {
    const message = await Message.create({ sender, recipient, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
};

// Récupérer la conversation entre deux utilisateurs
exports.getConversation = async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
      .sort({ timestamp: 1 })
      .populate("sender", "username imageUrl")
      .populate("recipient", "username imageUrl");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de la conversation" });
  }
};

// Récupérer tous les messages de l'utilisateur connecté (pour la liste des conversations)
exports.getAllUserMessages = async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .sort({ timestamp: -1 })
      .populate("sender", "username imageUrl")
      .populate("recipient", "username imageUrl");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des messages" });
  }
}; 