const mongoose = require("mongoose");

const raffelSchema = new mongoose.Schema({
  RaffelEndDate: {
    type: Date,
    required: true,
  },
  Url: {
    type: String,
    required: true,
    unique: true,
  },
  TicketSupply: {
    type: Number,
    required: true,
  },
  TicketPrice: {
    type: Number,
    required: true,
  },
  nft_name: {
    type: String,
    required: true,
  },
});

const nftRaffel = new mongoose.model("nftRaffel", raffelSchema);

module.exports = nftRaffel;
