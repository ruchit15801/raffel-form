const express = require("express");
const app = express();
require("./src/db/conn");
const router = require("./src/router/nftraffel");

app.use(express.json());
app.use("/", router);

// server port define
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
