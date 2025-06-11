const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assurez-vous que votre modèle utilisateur s'appelle 'User'
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema); 