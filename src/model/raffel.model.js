const mongoose = require("mongoose");

const raffelSchema = new mongoose.Schema({
  raffel_end_date: {
    type: Date,
    required: true,
  },
  url: {
    type: String,
    required: true,
    // unique: true,
  },
  ticket_supply: {
    type: Number,
    required: true,
  },
  ticket_remaining: {
    type: Number,
    required: true,
  },
  ticket_price: {
    type: Number,
    required: true,
  },
  token_address: {
    type: String,
    required: true,
  },
  wallet_address: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true
  }
});

const nftRaffel = new mongoose.model("Raffel", raffelSchema);

module.exports = nftRaffel;
