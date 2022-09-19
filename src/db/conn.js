const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/nft-raffel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.log(err);
    console.log("Error connecting DB!");
  });

module.exports = mongoose;
