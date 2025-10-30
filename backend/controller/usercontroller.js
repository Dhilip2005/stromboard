const Session = require('../module/user');

// @desc    Create a new whiteboard session
// @route   POST /api/sessions
exports.createSession = async (req, res) => {
  try {
    const { sessionName } = req.body;
    
    // Validation: Session name is required [cite: 125]
    if (!sessionName) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const newSession = new Session({ sessionName });
    const savedSession = await newSession.save();
    
    // Output: JSON object of created session [cite: 126]
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating session' });
  }
};

// @desc    Retrieve all whiteboard sessions
// @route   GET /api/sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    // Output: JSON array of sessions [cite: 130]
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching sessions' });
  }
};

// @desc    Retrieve a specific session by its ID
// @route   GET /api/sessions/:id
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      // Error Handling: Returns 404 if the session does not exist [cite: 134]
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    // Handle cases where the ID format is invalid
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.status(500).json({ error: 'Server error while fetching session' });
  }
};