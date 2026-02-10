const prisma = require('../../../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * User Registration
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    const roleRecord = await prisma.roles.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.users.create({
      data: { 
        name, 
        email, 
        password: hashed, 
        role_id: roleRecord.id 
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'User registered', 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};

/**
 * User Login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'JWT_SECRET not configured' 
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Current User
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role_id: true }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await prisma.users.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(email && { email }) }
    });

    res.json({ 
      success: true, 
      message: 'Profile updated', 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    next(err);
  }
};
