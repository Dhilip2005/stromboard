const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionName: {
    type: String,
    required: [true, 'Session name is required.'],
    trim: true,
  },
  // Store the entire canvas state as a single object (e.g., base64 data URL or array of drawing actions)
  // For this MVP, we'll store the drawing actions for replayability.
  drawingData: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', SessionSchema);