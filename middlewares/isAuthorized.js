// import model schema
const User = require("../models/User");

// check if user is authorized (exists in the database)
const isAuthorized = async (req, res, next) => {
  try {
    await User.findById(req.userId, { password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem.");
      if (!user) return res.status(404).send("You must have an account to make this request.");
      next();
    });
  } catch (err) {
    console.log('isAuthorized:\n' + err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = isAuthorized;