const Raffel = require("../model/raffel");

const newRaffel = async (req, res) => {
  try {
    const { RaffelStartDate, RaffelEndDate, TicketSupply, TicketPrice } =
      req.body;
    const user = await new Raffel({
      RaffelStartDate,
      RaffelEndDate,
      TicketSupply,
      TicketPrice,
    }).save();
    if (!user) {
      return res.status(200).send({ data: "not found" });
    }
    // await user.save();
    return res.status(200).send({ data: user });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

module.exports = { newRaffel };
