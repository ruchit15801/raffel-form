const express = require("express");
const router = express.Router();
const raffelData = require("../controller/nft");

router.post('/api/nft', raffelData.newRaffel);
router.post('/api/addWallet', raffelData.addWallet);
router.get('/getinfo', raffelData.getinfo)

module.exports = router;
