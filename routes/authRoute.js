const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleWare/authMiddleWare");
const { fetchUser } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signup);
router.post("/", login);
router.post("/logout", logout);

module.exports = router;
