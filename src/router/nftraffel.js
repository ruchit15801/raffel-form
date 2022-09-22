const express = require("express");
const router = express.Router();
const raffel_controller = require("../controller/raffel.controller");

router.post("/addWallet", raffel_controller.addWallet);
router.post("/createRaffel", raffel_controller.createRaffel);
router.get("/getinfo", raffel_controller.getinfo);


// buy ticket
router.post('/buyTicket', raffel_controller.buyTicket)
router.post('/ticketRemaining', raffel_controller.ticketRemaining)
router.post('/checkRemaining', raffel_controller.checkRemaining)
router.post('/participants', raffel_controller.participants)
router.get('/getAllData', raffel_controller.getAllData)



module.exports = router;
