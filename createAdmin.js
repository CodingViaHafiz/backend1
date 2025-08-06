const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Load .env file

// Import your User model
const User = require("./models/User"); // Adjust path if needed

// Connection URI from your .env
const MONGODB_URI = process.env.DB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10); // 🔒 Change this later!

    const adminUser = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
