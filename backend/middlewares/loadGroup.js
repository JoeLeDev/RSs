// Permet de checker les roles locaux et globaux (pilote dans un groupe par exemple)
const mongoose = require("mongoose");
const Group = require("../models/Group");


const loadGroup = async (req, res, next) => {
  const { id } = req.params;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);

  try {
    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    req.group = group; // tu peux l’attacher à la requête si besoin
    next();
  } catch (err) {
    console.error("Erreur middleware loadGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = loadGroup;
