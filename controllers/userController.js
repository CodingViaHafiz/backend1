const express = require("express");
const User = require("../models/userModel");

//Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to fetch users", error: error.message });
  }
};

// delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "user deleted", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to delete user", error: error.message });
  }
};

//
exports.fetchUser = async (req, res) => {
  console.log("[FETCH USER] /users/my called. req.user:", req.user);
  return res.status(200).json(req.user);
};

exports.TotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    console.log(totalUsers);
    return res.status(200).json({ totalUsers });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
