const express = require("express");
const cors = require("cors");
const app = express();
require("./src/db/mongodb");
const router = require("./src/router/nftraffel");

app.use(express.json());
app.use(cors({origin:true, credentials: true}));
app.use("/", router);

// server port define
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
