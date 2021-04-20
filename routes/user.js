// importing the express library but destructuring just the Router logic
const { Router } = require("express");

// create a new router
const router = new Router();

// require bcrypt for hashing the password
const bcrypt = require("bcrypt");

// import middleware
const verifyToken = require("../middlewares/verifyToken");

// import utils
const generateToken = require("../utils/generateToken");

// import model schema
const User = require("../models/User");

// routes/user.js

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     LoginUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email.
 *           example: express@gmail.com
 *         password:
 *           type: string
 *           description: The user password.
 *           example: express_password
 *     RegisterUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email.
 *           example: express@gmail.com
 *         password:
 *           type: string
 *           description: The user password.
 *           example: express_password
 *         name:
 *           type: string
 *           description: The user name.
 *           example: express_user
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: objectId
 *           description: The user ID.
 *           example: 60535c8a0f1f7e244eee6f79
 *         email:
 *           type: string
 *           description: The user email.
 *           example: express@gmail.com
 *         name:
 *           type: string
 *           description: The user name.
 *           example: express_user
 */

// public routes

// register user
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags: 
 *       - User Requests
 *     summary: Register a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Created a user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                   description: The authentication boolean value.
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: The jsonwebtoken value.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNTQ5MDdhMDk0NWNmMWM3NTdlYjdiMyIsImlhdCI6MTYxNjE1NDc0NiwiZXhwIjoxNjE2MTU1MzQ2fQ.vve5Jy_HKPFl_-sxU9WxzEsgUgZ-bxmKlhlmef2kHvI
*/
router.post("/register", async (req, res) => {
  try {
    await User.init();

    // check if the user exists 
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(409).send('A user with that email already exists.');

    // hash the password with 10 rounds
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // hashed password
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create user
    user = await User.create({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
    });

    // generate jwt token with user.id
    let token = generateToken(user.id);

    return res.status(201).send({ auth: true, token: token })
  } catch (err) {
    if (err.code == 11000 && err.keyPattern.email == 1)
      res.status(500).send('Duplicate Email');
    else
      res.status(500).send('Internal Server Error');
  }
});

// login user
/**
 * @swagger
 * /user/login:
 *   post:
 *     tags: 
 *       - User Requests
 *     summary: Login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       201:
 *         description: Logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                   description: The authentication boolean value.
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: The jsonwebtoken value.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNTQ5MDdhMDk0NWNmMWM3NTdlYjdiMyIsImlhdCI6MTYxNjE1NDc0NiwiZXhwIjoxNjE2MTU1MzQ2fQ.vve5Jy_HKPFl_-sxU9WxzEsgUgZ-bxmKlhlmef2kHvI
*/
router.post('/login', async function (req, res) {
  try {
    // check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send('Invalid Credentials');

    // check if the password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send({ auth: false, token: null, msg: 'Invalid Credentials' });

    // generate jwt token with user.id
    let token = generateToken(user.id);

    return res.status(201).send({ auth: true, token: token })
  } catch (err) {
      res.status(500).send('Internal Server Error');
  }
});

// private routes

// check user authorization
/**
 * @swagger
 * /user/isAuthorized:
 *   get:
 *     tags: 
 *       - User Requests
 *     summary: Check a user authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Verified a user authorization.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
*/
router.get('/isAuthorized', verifyToken, async function (req, res) {
  try {
    const user = await User.findById(req.userId, { password: 0 }); // return user without password
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send("There was a problem finding the user.");
  }
});

// export the router function
module.exports = router;