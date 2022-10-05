const mongoose = require("mongoose");

const sellerWalletSchema = new mongoose.Schema({
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

const SellerWallet = mongoose.model("sellerWallet", sellerWalletSchema);

module.exports = SellerWallet; 