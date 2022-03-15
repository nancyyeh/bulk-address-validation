const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1: {
        type: String,
        required: true,
    },
    line2: String,
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    zip: {
        type: String,
        required: true,
    }, //use string instead of number for future support in internation zip codes with inconsisitent formats
  },
  {timestamps: true}
);

module.exports = mongoose.model('Address', addressSchema)