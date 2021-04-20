// to allow the use of .env file variables
require("dotenv").config();

// import web framework package
const express = require("express");

// import mongoose connection
const mongoose = require("./db/index")

// import routes
const routes = require("./routes");

// import cors cross origin
// const cors = require("cors");

// create an instance of express app
const app = express();

// middleware
// app.use(cors()); // allow cors (interaction between frontend and backend) (different ports)
app.use(express.json()); // allow access to req.body
app.use(express.urlencoded({ extended: false })); // if false the values can be a string or array

// swagger
const swaggerJSDoc = require('swagger-jsdoc'); // to integrate Swagger using JSDoc comments in the code
const swaggerUi = require('swagger-ui-express'); // to serve auto-generated swagger-ui generated API docs from express
// use v5 because it's before ecmascript modules (import "")
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API',
    description: 'Express API Example',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:4444',
      description: 'Development server'
    },
    {
      "url": "https://swaggerapi.herokuapp.com/",
      "description": "Production server"
    }
  ]
};

const options = {
  swaggerDefinition,
  // paths to files containing OpenAPI definitions such as the annotations above
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
// mount routes
routes(app);

// storing the value of the environment variable PORT in port
const port = process.env.PORT || 4444;

// tell the express app to listen on a specific port
app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});


