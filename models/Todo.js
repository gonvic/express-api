const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
},
  {
    timestamps: true
  }
);

mongoose.model('Todo', TodoSchema);
module.exports = mongoose.model('Todo');