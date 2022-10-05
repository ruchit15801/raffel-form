const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  buyers_wallet: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
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

const participant = new mongoose.model("Participant", participantSchema);

module.exports = participant;
