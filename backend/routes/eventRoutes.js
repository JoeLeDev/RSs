const express = require('express');
const router = express.Router();
const { createEvent, getEvents, updateEvent, deleteEvent, getEventById, bulkDeleteEvents } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Routes pour les événements
router.get('/', authMiddleware, getEvents);
router.post('/', authMiddleware, upload.single('image'), createEvent);
router.get('/:id', authMiddleware, getEventById);
router.put('/:id', authMiddleware, upload.single('image'), updateEvent);

// Nouvelle route pour la suppression en masse
router.delete('/bulk', authMiddleware, bulkDeleteEvents);

router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router; 