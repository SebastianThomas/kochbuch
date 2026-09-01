const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ItemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  ingredients: {
    type: Array,
    required: true,
  },
  pictures: {
    type: Array,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  recipeType: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('item', ItemSchema, 'items');
