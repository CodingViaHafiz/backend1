const jwt = require("jsonwebtoken");

// middleware: protects routes (check token)
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token found, authorization denied" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded:", decoded); // Should show { id: "...", iat, exp }

    // fetch user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};

// admin Only middleware
const User = require("../models/userModel");

const adminOnly = (req, res, next) => {
  // console.log("user trying to access admin route:", req.user);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
};

module.exports = { protect, adminOnly };
