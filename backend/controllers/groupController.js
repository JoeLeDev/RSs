// controllers/groupController.js
const Group = require("../models/Group");
const User = require("../models/User");
const { defineAbilityFor } = require("../abilities/defineAbilityFor");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// 🔁 Obtenir tous les groupes
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "username email")
      .populate("roles.userId", "username imageUrl");
    res.status(200).json(groups);
  } catch (err) {
    console.error("Erreur GET /groups:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ➕ Créer un groupe
exports.createGroup = async (req, res) => {
  const { name, description, meetingDay, meetingLocation } = req.body;
  if (!name || !meetingDay) return res.status(400).json({ message: "Nom et jour requis." });
  try {
    const group = await Group.create({
      name,
      description,
      meetingDay,
      meetingLocation,
      createdBy: req.user._id,
      members: [req.user._id],
      roles: [{ userId: req.user._id, role: "pilote" }]
    });
    res.status(201).json(group);
  } catch (err) {
    console.error("Erreur création groupe:", err);
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};

// 🛠️ Mettre à jour un groupe

exports.updateGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    group.name = req.body.name || group.name;
    group.description = req.body.description || group.description;
    group.meetingLocation = req.body.meetingLocation || group.meetingLocation;

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur updateGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🗑️ Supprimer un groupe
exports.deleteGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    await Group.deleteOne({ _id: group._id }); // ✅ safe & simple

    res.status(200).json({ message: "Groupe supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔍 Obtenir un groupe par ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("members", "username email");
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });
    res.status(200).json(group);
  } catch (err) {
    console.error(" Erreur GET /groups/:id :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ➕ Rejoindre un groupe
exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });
    if (!group.members.some(m => m.toString() === req.user._id)) {
      group.members.push(req.user._id);
      group.roles.push({ userId: req.user._id, role: "membre" });
      await group.save();
      // Notifier le pilote/admin du groupe
      const pilot = group.roles.find(r => r.role === "pilote");
      if (pilot && pilot.userId.toString() !== req.user._id) {
        const user = await User.findById(req.user._id);
        const notif = await Notification.create({
          user: pilot.userId,
          type: "group_invite",
          content: `${user?.username || "Un membre"} a rejoint votre groupe` ,
          link: `/groups/${group._id}`
        });
        // Notif temps réel
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        if (userSockets && io && userSockets[pilot.userId]) {
          io.to(userSockets[pilot.userId]).emit('notification', notif);
        }
      }
    }
    res.status(200).json({ message: "Inscription réussie" });
  } catch (err) {
    console.error("Erreur joinGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// ➖ Quitter un groupe
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });
    group.members = group.members.filter(m => m.toString() !== req.user._id);
    group.roles = group.roles.filter(r => r.userId.toString() !== req.user._id);
    await group.save();
    res.status(200).json({ message: "Tu as quitté le groupe" });
  } catch (err) {
    console.error("Erreur leaveGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//  Changer le rôle d'un membre
exports.updateGroupRole = async (req, res) => {
  const { id } = req.params;
  const { memberId, role } = req.body;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    // ✅ Supprimer tous les anciens rôles "pilote"
    group.roles = group.roles.filter((r) => r.role !== "pilote");

    // ✅ Si un nouveau pilote est défini, on vérifie qu'il est membre et on l'ajoute
    if (memberId) {
      const isMember = group.members.some((m) => m.toString() === memberId);
      if (!isMember) {
        return res.status(400).json({ message: "Le membre n'appartient pas à ce groupe" });
      }

      group.roles.push({ userId: memberId, role: role });
    }

    await group.save();
    res.status(200).json({ message: "Rôle mis à jour" });

  } catch (err) {
    console.error("Erreur PATCH /groups/:id/roles :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔍 Obtenir les membres d'un groupe
exports.getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "username email")
      .populate("roles.userId", "username email")
      .populate("memberInfos.userId", "username email");

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    const members = group.members.map((member) => {
      const role = group.roles.find((r) => r.userId.toString() === member._id.toString());
      const info = group.memberInfos.find((i) => i.userId.toString() === member._id.toString());

      return {
        _id: member._id,
        username: member.username,
        email: member.email,
        role: role?.role || "membre",
        joinedAt: info?.joinedAt || null
      };
    });

    res.status(200).json(members);
  } catch (err) {
    console.error("Erreur getGroupMembers:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.kickMember = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    const requesterId = req.user._id;

    // 🛡 Vérifie que le membre à supprimer n'est pas un admin global
    if (userId === requesterId)
      return res.status(400).json({ message: "Tu ne peux pas te retirer toi-même." });

    // 🛡 Autorisation : admin global ou pilote local
    // Cette logique est maintenant gérée par le middleware checkAbility
    // const isPilot = group.roles?.some(
    //   (r) => r.role === "pilote" && r.userId.toString() === requesterId
    // );
    // const isAdmin = req.user.role === "admin";

    // if (!isAdmin && !isPilot)
    //   return res.status(403).json({ message: "Accès refusé" });

    // 🧼 Retirer le membre
    group.members = group.members.filter((m) => m.toString() !== userId);
    group.roles = group.roles.filter((r) => r.userId.toString() !== userId);
    group.memberInfos = group.memberInfos.filter((m) => m.userId.toString() !== userId);

    await group.save();

    res.status(200).json({ message: "Membre retiré avec succès" });
  } catch (err) {
    console.error("Erreur kickMember:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};