const dotenv = require("dotenv");
dotenv.config();
const ImageKit = require("imagekit");

const imageKit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

module.exports = imageKit;
