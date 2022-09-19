const express = require("express");
const router = express.Router();
const raffelData = require("../controller/nft");

router.post("/api/nft", raffelData.newRaffel);

module.exports = router;
