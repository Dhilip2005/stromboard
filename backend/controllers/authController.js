const User = require('../module/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const JWT_EXPIRES = '7d';

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, provider, photoURL } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Name and email are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = password ? await bcrypt.hash(password, 10) : undefined;

    const user = new User({ name, email, password: hashed, provider: provider || 'email', photoURL });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // If user registered with email provider we require password
    if (user.provider === 'email') {
      if (!user.password) return res.status(401).json({ error: 'No password set for this account' });
      const match = await bcrypt.compare(password || '', user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
