const user = require("./user");
const todo = require("./todo");

// export the routes
module.exports = (app) => {
  app.use("/user", user);
  app.use("/todo", todo);
};