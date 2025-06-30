const User = require("../models/User");

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
    console.error("Erreur syncUser :", error);
    res.status(500).json({ message: "Erreur lors de la synchronisation" });
  }
};


exports.updateUser = async (req, res) => {
  const userId = req.user.firebaseUid; // <-- Utiliser firebaseUid de req.user
  const { username, imageUrl, country } = req.body;

  try {
    const updateFields = {};

    // if (email) updateFields.email = email; // <-- Ne pas mettre à jour l'email ici (géré par Firebase)
    if (username !== undefined) updateFields.username = username;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (country !== undefined) updateFields.country = country;

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
    console.error("Erreur updateUser :", err);
    res.status(500).json({ message: "Erreur mise à jour profil" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  console.log("GET /api/users/:userId called"); // Log de début de fonction
  const userId = req.params.userId;
  console.log("Requested User ID:", userId); // Log de l'ID reçu
  try {
    const user = await User.findById(userId).select("-password -firebaseUid"); // Utiliser l'ID reçu
    console.log("User found in DB:", user); // Log du résultat de la recherche
    if (!user) {
      console.log("User not found for ID:", userId); // Log si l'utilisateur n'est pas trouvé
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur GET /api/users/:userId:", err); // Log d'erreur
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

