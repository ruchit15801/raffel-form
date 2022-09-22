const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyers_wallet: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  token_address: {
    type: String,
    required: true,
  }
});

const transaction = new mongoose.model("Transaction", transactionSchema);

module.exports = transaction;
