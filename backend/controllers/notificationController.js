const Notification = require("../models/Notification");

// Récupérer les notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ isRead: 1, createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification introuvable" });
    res.status(200).json(notif);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Toutes les notifications marquées comme lues." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du marquage des notifications." });
  }
}; 