const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const SubscriptionSchema = new Schema({
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    type: Schema.Types.Mixed,
    required: true,
  },
  expirationTime: {
    type: String,
    required: false,
  },
  options: {
    type: Object,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'subscription',
  SubscriptionSchema,
  'subscriptions',
);
