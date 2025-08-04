//import dependencies
// require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connection = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 1000;

// initialize express app
const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONT_END, credentials: true }));
app.use(express.urlencoded({ extended: true }));
// import routes
const authRoutes = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");

// connect to mongoDB
connection();

app.get("/", (req, res) => {
  res.send("");
});

// routes middleware
app.use("/", authRoutes);
app.use("/posts", postRoute);
app.use("/users", userRoute);

// railway deployment
const path = require("path");

// Serve React build
app.use(express.static(path.join(__dirname, "../front-end/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/build/index.html"));
});

// start the server
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
