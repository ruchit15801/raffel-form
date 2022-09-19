const mongoose = require("mongoose");

const raffelSchema = new mongoose.Schema({
  RaffelStartDate: {
    type: Date,
    required: true,
  },
  RaffelEndDate: {
    type: Date,
    required: true,
  },
  TicketSupply: {
    type: Number,
    required: true,
  },
  TicketPrice: {
    type: Number,
    default: "$",
    required: true,
  },
});

const nftRaffel = new mongoose.model("nftRaffel", raffelSchema);

module.exports = nftRaffel;
