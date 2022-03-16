const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    //use string instead of number for future support in internation zip codes with inconsisitent formats
    zip: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
