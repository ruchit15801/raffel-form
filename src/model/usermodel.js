const mongoose = require("mongoose");

const WalletUserSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
  },
  collection_name: {
    type: String,
    required: true,
  },  
  nft_name: {
    type: String,
    required: true,
  },
  token_address: {
    type: String,
    required: true,
  }
});

const WalletUser = mongoose.model("WalletUser", WalletUserSchema);

module.exports = WalletUser;