const Raffel = require("../model/raffel");
const WalletUser = require("../model/usermodel");
const HTTP = require("../constant/response.code");

const newRaffel = async (req, res) => {
  try {
    const { RaffelEndDate, TicketSupply, TicketPrice, Url, nft_name } =
      req.body;

    // const url_check = await Raffel.find({ Url });
    // if (url_check) return res.status(200).send({ data: "data already added" });

    const user = await new Raffel({
      RaffelEndDate,
      Url,
      TicketSupply,
      TicketPrice,
      nft_name,
    }).save();

    if (!user) {
      return res.status(200).send({ data: "not found" });
    }

    return res.status(200).send({ data: user });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

const addWallet = async (req, res) => {
  try {
    const { wallet, collection_name, nft_name, token_address } = req.body;
    if (!req.body || !wallet || !collection_name || !nft_name || !token_address)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "All fields are required!",
        data: {},
      });

    // const walletExists = await WalletUser.findOne({
    //     wallet
    // });
    // if (walletExists)
    //     return res.status(HTTP.SUCCESS).send({
    //         success: false,
    //         code: HTTP.BAD_REQUEST,
    //         message: 'Wallet already exists with same name!',
    //         data: {},
    //     });
    const walletData = await new WalletUser({
      wallet,
      collection_name,
      nft_name,
      token_address,
    }).save();
    if (!walletData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Unable to save wallet data",
        data: {},
      });
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "wallet data.",
      data: { walletData },
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

const getinfo = async (req, res) => {
  try {
    const wallet_data = await WalletUser.find({}, { _id: 0, __v: 0 });
    const nftRaffel_data = await Raffel.find({}, { _id: 0, __v: 0 });
    const walletData = [];
    const nftRaffelData = [];

    for (let i = 0; i < wallet_data.length; i++) {
      walletData.push(wallet_data[i]);
    }
    for (let i = 0; i < nftRaffel_data.length; i++) {
      nftRaffelData.push(nftRaffel_data[i]);
    }
    // convert stringify
    const json = JSON.stringify(walletData);
    const json1 = JSON.stringify(nftRaffelData);
    // convert json
    const obj = JSON.parse(json);
    const obj1 = JSON.parse(json1);
    // Combine
    const mergeById = (array1, array2) =>
      array1.map((itm) => ({
        ...array2.find((item) => item.studentId === itm.studentId && item),
        ...itm,
      }));

    const result = mergeById(obj, obj1);
    console.log(mergeById(obj, obj1));
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "get data",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

module.exports = {
  newRaffel,
  addWallet,
  getinfo,
};
