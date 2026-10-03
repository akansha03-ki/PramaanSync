const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, badgeId, station } = req.body;

    if (!name || !email || !password || !badgeId || !station) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const user = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'Investigator',
      badgeId,
      station
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeId: user.badgeId,
        station: user.station
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const userCount = await User.countDocuments();
      console.warn(`[Auth WARNING] Login failed: User '${cleanEmail}' not found in database (Total DB users: ${userCount}).`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      console.warn(`[Auth WARNING] Login failed: Password mismatch for user '${cleanEmail}'.`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log(`[Auth SUCCESS] User '${cleanEmail}' (${user.role}) authenticated successfully.`);

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeId: user.badgeId,
        station: user.station
      }
    });
  } catch (err) {
    console.error('[Auth ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, station, badgeId } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (station) user.station = station;
    if (badgeId) user.badgeId = badgeId;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
