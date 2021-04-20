// to use .env file variables
require("dotenv").config();

// used to create, verify, and decode tokens
const jwt = require("jsonwebtoken");

// contains secret key used to sign tokens
const secret = process.env.jwtSecret;

// check if the token is valid
const verifyToken = async (req, res, next) => {
  try {
    // get bearer token from header
    const authorizationHeader = req.header('authorization');
    // check if bearer token and token exist and assign only token
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    console.log(authorizationHeader);

    // check if the token exists and if not then return not authorized
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });

    // check if the token is valid
    const payload = jwt.verify(token, secret);

    // append the payload id to the request
    req.userId = payload.id;

    next();
  } catch (err) {
    console.log('verifyToken:\n' + err);
    res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
}

module.exports = verifyToken;