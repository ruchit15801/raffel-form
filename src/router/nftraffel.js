const express = require("express");
const router = express.Router();
const raffel_controller = require("../controller/raffel.controller");

router.post("/addRaffel", raffel_controller.addRaffel);
router.post("/createRaffel", raffel_controller.createRaffel);
// router.get("/getinfo", raffel_controller.getinfo);

// buy ticket
router.post('/buyTicket', raffel_controller.buyTicket)
router.post('/ticketRemaining', raffel_controller.ticketRemaining)
router.post('/checkRemaining', raffel_controller.checkRemaining)
router.post('/participants', raffel_controller.participants)
router.get('/getAllData', raffel_controller.getAllData)

router.post('/getWinner', raffel_controller.getWinner)


// stop watch
// router.post('/stopwatch', raffel_controller.stopwatch)

module.exports = router;
