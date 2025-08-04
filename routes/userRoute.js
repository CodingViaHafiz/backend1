const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleWare/authMiddleWare");
const {
  getAllUsers,
  deleteUser,
  fetchUser,
  TotalUsers,
} = require("../controllers/userController");

// get all users route
router.get("/", protect, adminOnly, getAllUsers);

// delete user
router.delete("/:id", protect, adminOnly, deleteUser);

// fetch user
router.get("/my", protect, fetchUser);
// get totalUsers
router.get("/userStats", protect, adminOnly, TotalUsers);

module.exports = router;
