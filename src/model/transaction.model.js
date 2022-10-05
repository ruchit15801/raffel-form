const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyers_wallet:{
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  blockTime: {
    type: Number,
    required: true,
  },
  totalTickes: {
    type: Number,
    // required: true,
  }
});

const transaction = new mongoose.model("Transaction", transactionSchema);

module.exports = transaction;
