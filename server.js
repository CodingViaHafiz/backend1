// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

// Import dependencies
const express = require("express");
const connection = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Initialize express app
const app = express();

// Define port (Railway provides process.env.PORT automatically)
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONT_END, credentials: true }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");

// Connect to MongoDB
connection();

// Root route for testing
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Use routes
app.use("/", authRoutes);
app.use("/posts", postRoute);
app.use("/users", userRoute);

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log("ENV PORT:", process.env.PORT);
  console.log(`Server is running on port: ${port}`);
});
