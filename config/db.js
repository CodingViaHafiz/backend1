const mongoose = require("mongoose");
// require("dotenv").config();
const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("conneted to database successfully!");
  } catch (error) {
    console.log("error while connecting to database: ", error);
  }
};
module.exports = connection;
