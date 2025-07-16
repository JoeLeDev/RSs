const Event = require('../models/Event');
const upload = require('../middlewares/uploadMiddleware');

// Obtenir tous les événements d'un utilisateur
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des événements.' });
  }
};

// Créer un nouvel événement
const createEvent = async (req, res) => {
  // Seuls les admins ou gestionnaires d'événements peuvent créer
  if (req.user.role !== 'admin' && req.user.role !== 'event_manager') {
    return res.status(403).json({ message: "Accès refusé : seuls les admins ou gestionnaires peuvent créer un événement." });
  }
  const { title, description, start, end } = req.body;
  const image = req.file ? req.file.path : null;

  if (!title || !start || !end) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
  }

  // Validation des dates
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ message: 'Les dates fournies sont invalides.' });
  }

  if (endDate <= startDate) {
    return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début.' });
  }

  try {
    const newEvent = new Event({
      title,
      description,
      image,
      start: startDate,
      end: endDate,
      user: req.user._id,
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Erreur détaillée lors de la création de l'événement :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'événement.", error: error.message });
  }
};

// Mettre à jour un événement
const updateEvent = async (req, res) => {
  // Seuls les admins ou gestionnaires d'événements peuvent modifier
  if (req.user.role !== 'admin' && req.user.role !== 'event_manager') {
    return res.status(403).json({ message: "Accès refusé : seuls les admins ou gestionnaires peuvent modifier un événement." });
  }
  const { id } = req.params;
  const { title, description, start, end } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    let event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé.' });
    }

    // S'assurer que l'utilisateur est le propriétaire de l'événement
    if (event.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Non autorisé à modifier cet événement.' });
    }

    // Validation des dates si elles sont fournies
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Les dates fournies sont invalides.' });
      }

      if (endDate <= startDate) {
        return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début.' });
      }

      event.start = startDate;
      event.end = endDate;
    }

    event.title = title || event.title;
    event.description = description !== undefined ? description : event.description;
    if (image) {
      event.image = image;
    }

    event = await event.save();
    res.status(200).json(event);
  } catch (error) {
    console.error("Erreur détaillée lors de la mise à jour de l'événement :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'événement.", error: error.message });
  }
};

// Supprimer un événement
const deleteEvent = async (req, res) => {
  // Seuls les admins ou gestionnaires d'événements peuvent supprimer
  if (req.user.role !== 'admin' && req.user.role !== 'event_manager') {
    return res.status(403).json({ message: "Accès refusé : seuls les admins ou gestionnaires peuvent supprimer un événement." });
  }
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé.' });
    }

    // S'assurer que l'utilisateur est le propriétaire de l'événement
    if (event.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Non autorisé à supprimer cet événement.' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Événement supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur détaillée lors de la suppression de l'événement :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'événement.", error: error.message });
  }
};

// Obtenir un événement par son ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé.' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'événement." });
  }
};

// Supprimer plusieurs événements
const bulkDeleteEvents = async (req, res) => {
  // Seuls les admins ou gestionnaires d'événements peuvent supprimer en masse
  if (req.user.role !== 'admin' && req.user.role !== 'event_manager') {
    return res.status(403).json({ message: "Accès refusé : seuls les admins ou gestionnaires peuvent supprimer des événements." });
  }
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Veuillez fournir un tableau d\'identifiants d\'événements.' });
  }

  try {
    // Vous pouvez ajouter ici une logique de vérification de rôle
    // Par exemple, vérifier si l'utilisateur est un administrateur ou un gestionnaire d'événements.
    // Pour l'instant, nous allons simplement supprimer les événements par leurs IDs.
    
    // Si vous souhaitez limiter la suppression aux propres événements de l'utilisateur, vous feriez :
    // const result = await Event.deleteMany({ _id: { $in: ids }, user: req.user._id });
    
    // Si les événements sont partagés et que seuls les admins/gestionnaires peuvent supprimer,
    // vous devriez vérifier le rôle de req.user ici.

    const result = await Event.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Aucun événement trouvé pour les identifiants fournis ou non autorisé.' });
    }

    res.status(200).json({ message: `${result.deletedCount} événement(s) supprimé(s) avec succès.` });
  } catch (error) {
    console.error("Erreur détaillée lors de la suppression en masse des événements :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression en masse des événements.", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getEventById,
  bulkDeleteEvents
}; 