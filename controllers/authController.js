const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//signup (register user)
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: "Signup successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN] Failed: User not found for email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Failed: Invalid credentials for email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // include role in token
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log(
      `[LOGIN] Success: User ${user.email} logged in, token cookie set.`
    );

    res.status(200).json({
      message: "Login successful!",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// logout
exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expiresIn: new Date(0),
      path: "/",
    });
    res.status(200).json({ message: "Logout success!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
