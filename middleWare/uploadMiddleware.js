// middlewares/multer.js
const multer = require("multer");

const storage = multer.memoryStorage(); // buffer instead of file

const upload = multer({ storage });

module.exports = upload;
