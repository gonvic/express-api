// to use .env file variables
require("dotenv").config();

// used to create, verify, and decode tokens
const jwt = require("jsonwebtoken");

// contains secret key used to sign tokens
const secret = process.env.jwtSecret;

// create a jwt token
function generateJWTToken(userId) {
  // payload for jwt
  const payload = {
    id: userId
  };

  return jwt.sign(payload, secret, { expiresIn: "10min" });
}

module.exports = generateJWTToken;
