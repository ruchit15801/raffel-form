const Raffel = require("../model/raffel");

const newRaffel = async (req, res) => {
  try {
    const { RaffelEndDate, TicketSupply, TicketPrice, Url } = req.body;

    // const url_check = await Raffel.find({ Url });
    // if (url_check) return res.status(200).send({ data: "data already added" });

    const user = await new Raffel({
      RaffelEndDate,
      Url,
      TicketSupply,
      TicketPrice,
    }).save();

    if (!user) {
      return res.status(200).send({ data: "not found" });
    }

    return res.status(200).send({ data: user });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

module.exports = { newRaffel };
