const express = require('express');
const router = express.Router();
const {
  createSession,
  getAllSessions,
  getSessionById,
} = require('../controller/usercontroller');

// POST /api/sessions - Create a new session [cite: 78, 123]
router.post('/', createSession);

// GET /api/sessions - Retrieve all sessions [cite: 79, 128]
router.get('/', getAllSessions);

// GET /api/sessions/:id - Retrieve a specific session by ID [cite: 80, 132]
router.get('/:id', getSessionById);

module.exports = router;