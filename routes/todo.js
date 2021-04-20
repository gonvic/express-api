// importing the express library but destructuring just the Router logic
const { Router } = require("express");

// create a new router
const router = new Router();

// import middlewares
const verifyToken = require("../middlewares/verifyToken");
const isAuthorized = require("../middlewares/isAuthorized");

// import model schema
const Todo = require("../models/Todo");

// routes/todo.js

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     NewTodo:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: The user name.
 *           example: express_user
 *         name:
 *           type: string
 *           description: The todo name.
 *           example: Create an express api.
 *         description:
 *           type: string
 *           description: The todo description.
 *           example: Create an express api, with authentication and swagger.
 *     Todo:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: objectId
 *               description: The todo ID.
 *               example: 60535c8a0f1f7e244eee6f79
 *         - $ref: '#/components/schemas/NewTodo'
 */

// public routes

// find all todos
/**
 * @swagger
 * /todo/:
 *   get:
 *     tags: 
 *       - Todo Requests
 *     summary: Retrieve a list of the todos.
 *     description: Retrieve a list of the todos. Can be used to get a list of all todos.
 *     responses:
 *       200:
 *         description: A list of todos.
 *         content:
 *           application/json:
 *             schema:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */
 router.get("/", async (req, res) => {
  try {
    // check if any todo exists 
    const todo = await Todo.find();
    if (!todo) return res.status(409).send('No todo exists.');
    return res.status(200).send(todo);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

// private routes

// create Todo
/**
 * @swagger
 * /todo/create:
 *   post:
 *     tags: 
 *       - Todo Requests
 *     summary: Create a Todo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTodo'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created a Todo.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Todo created.
*/
router.post("/create", verifyToken, isAuthorized, async (req, res) => {
  try {
    await Todo.init();

    // destructure the user, name, description from the body of the request
    const { user, name, description } = req.body;

    // check if the todo exists 
    let todo = await Todo.findOne({ user: req.body.user, name: req.body.name });
    if (todo) return res.status(409).send('A todo with that user and name already exists.');

    // create todo
    todo = await Todo.create({
      user: user,
      name: name,
      description: description,
    });

    return res.status(201).send('Todo created.');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

// export the router function
module.exports = router;