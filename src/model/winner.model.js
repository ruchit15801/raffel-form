const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  buyers_wallet: {
    type: String,
    required: true,
  },
  token_address: {
    type: String,
    required: true, 
  }
});

const Winner = new mongoose.model("Winner", winnerSchema);

module.exports = Winner;
