const User = require('../models/User'); // Adjusted path for the User model
const bcrypt = require('bcryptjs');

// User sign-up functionality
exports.signUp = async (req, res) => {
  const { firstName, lastName, idRollNo, email, password, confirmPassword, role } = req.body;
  
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  if (!firstName || !lastName || !idRollNo || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { idRollNo }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or roll number already exists' });
    }

    const newUser = new User({ firstName, lastName, idRollNo, email, password: hashedPassword, role });
    await newUser.save();
    res.status(200).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// User login functionality
exports.login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ 'email': userId });
    if (!user) return res.status(400).json({ msg: 'User ID/Password is incorrect' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'User ID/Password is incorrect' });

    res.json({ name: user.firstName, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user' });
  }
};
