const User = require("../models/User");
const Notification = require("../models/Notification");

exports.syncUser = async (req, res) => {
  const { firebaseUid, email, username, imageUrl } = req.body;

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        username,
        imageUrl: imageUrl || "",
        role: "user", // par défaut
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la synchronisation" });
  }
};


exports.updateUser = async (req, res) => {
  const userId = req.user.firebaseUid;
  // Sécurité : on ne permet la modification que pour l'utilisateur courant
  if (!req.user || !userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  const { username, imageUrl, country, notifEmail, notifPush } = req.body;

  try {
    const updateFields = {};

    // if (email) updateFields.email = email; // <-- Ne pas mettre à jour l'email ici (géré par Firebase)
    if (username !== undefined) updateFields.username = username;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (country !== undefined) updateFields.country = country;
    if (notifEmail !== undefined) updateFields.notifEmail = notifEmail;
    if (notifPush !== undefined) updateFields.notifPush = notifPush;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: userId }, // <-- Recherche par firebaseUid
      updateFields,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
        // Ce 404 est renvoyé si l'utilisateur n'est pas trouvé par firebaseUid
        return res.status(404).json({ message: "Utilisateur introuvable pour mise à jour" });
    }

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour profil" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  if (req.params.userId === 'me') {
    return res.status(400).json({ message: "Utilisez /api/users/me pour l'utilisateur courant." });
  }
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).select("-password -firebaseUid"); // Utiliser l'ID reçu
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username imageUrl');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Envoyer une demande d'ami
exports.sendFriendRequest = async (req, res) => {
  const { userId } = req.body; // ID du destinataire
  const fromId = req.user._id;
  if (fromId.toString() === userId) return res.status(400).json({ message: "Impossible de s'ajouter soi-même." });
  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(userId);
    if (!toUser) return res.status(404).json({ message: "Utilisateur introuvable." });
    if (fromUser.friends.includes(userId)) return res.status(400).json({ message: "Déjà amis." });
    if (fromUser.friendRequestsSent.includes(userId)) return res.status(400).json({ message: "Demande déjà envoyée." });
    fromUser.friendRequestsSent.push(userId);
    toUser.friendRequestsReceived.push(fromId);
    await fromUser.save();
    await toUser.save();
    // Création de la notification
    const notif = await Notification.create({
      user: userId,
      type: "friend_request",
      content: `${fromUser.username} t'a envoyé une demande d'ami`,
      link: `/profile/${fromUser._id}?acceptFriendRequest=1`
    });
    // Notif temps réel
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (userSockets && io && userSockets[userId]) {
      io.to(userSockets[userId]).emit('notification', notif);
    }
    res.status(200).json({ message: "Demande d'ami envoyée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'envoi de la demande." });
  }
};

// Accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
  const { userId } = req.body; // ID de l'expéditeur
  const toId = req.user._id;
  try {
    const toUser = await User.findById(toId);
    const fromUser = await User.findById(userId);
    if (!fromUser) return res.status(404).json({ message: "Utilisateur introuvable." });
    if (!toUser.friendRequestsReceived.includes(userId)) return res.status(400).json({ message: "Pas de demande reçue de cet utilisateur." });
    // Ajout mutuel
    toUser.friends.push(userId);
    fromUser.friends.push(toId);
    // Suppression des demandes
    toUser.friendRequestsReceived = toUser.friendRequestsReceived.filter(id => id.toString() !== userId);
    fromUser.friendRequestsSent = fromUser.friendRequestsSent.filter(id => id.toString() !== toId);
    await toUser.save();
    await fromUser.save();
    // Création de la notification
    const notif = await Notification.create({
      user: userId,
      type: "friend_accept",
      content: `${toUser.username} a accepté ta demande d'ami`,
      link: `/profile/${toUser._id}`
    });
    // Notif temps réel
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (userSockets && io && userSockets[userId]) {
      io.to(userSockets[userId]).emit('notification', notif);
    }
    res.status(200).json({ message: "Demande d'ami acceptée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'acceptation de la demande d'ami.", error: err?.message || err });
  }
};

// Refuser une demande d'ami
exports.rejectFriendRequest = async (req, res) => {
  const { userId } = req.body; // ID de l'expéditeur
  const toId = req.user._id;
  try {
    const toUser = await User.findById(toId);
    const fromUser = await User.findById(userId);
    if (!fromUser) return res.status(404).json({ message: "Utilisateur introuvable." });
    toUser.friendRequestsReceived = toUser.friendRequestsReceived.filter(id => id.toString() !== userId);
    fromUser.friendRequestsSent = fromUser.friendRequestsSent.filter(id => id.toString() !== toId);
    await toUser.save();
    await fromUser.save();
    res.status(200).json({ message: "Demande d'ami refusée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du refus." });
  }
};

// Annuler une demande envoyée
exports.cancelFriendRequest = async (req, res) => {
  const { userId } = req.body; // ID du destinataire
  const fromId = req.user._id;
  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(userId);
    if (!toUser) return res.status(404).json({ message: "Utilisateur introuvable." });
    fromUser.friendRequestsSent = fromUser.friendRequestsSent.filter(id => id.toString() !== userId);
    toUser.friendRequestsReceived = toUser.friendRequestsReceived.filter(id => id.toString() !== fromId);
    await fromUser.save();
    await toUser.save();
    res.status(200).json({ message: "Demande annulée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'annulation." });
  }
};

// Retirer un ami
exports.removeFriend = async (req, res) => {
  const { userId } = req.body; // ID de l'ami à retirer
  const meId = req.user._id;
  try {
    const me = await User.findById(meId);
    const friend = await User.findById(userId);
    if (!friend) return res.status(404).json({ message: "Utilisateur introuvable." });
    me.friends = me.friends.filter(id => id.toString() !== userId);
    friend.friends = friend.friends.filter(id => id.toString() !== meId);
    await me.save();
    await friend.save();
    res.status(200).json({ message: "Ami retiré." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du retrait." });
  }
};

// Lister les amis
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username imageUrl');
    res.status(200).json(user.friends);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des amis." });
  }
};

// Lister les demandes reçues/envoyées
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequestsSent', 'username imageUrl')
      .populate('friendRequestsReceived', 'username imageUrl');
    res.status(200).json({
      sent: user.friendRequestsSent,
      received: user.friendRequestsReceived
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Suppression du compte utilisateur courant
exports.deleteMe = async (req, res) => {
  // Sécurité : on ne permet la suppression que pour l'utilisateur courant
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  try {
    const userId = req.user._id;
    await User.deleteOne({ _id: userId });
    // TODO : supprimer les données associées (posts, messages, etc.) si besoin
    res.status(200).json({ message: 'Compte supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du compte.' });
  }
};

