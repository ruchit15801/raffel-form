const Raffel = require("../model/raffel");
const WalletUser = require("../model/usermodel");
const HTTP = require("../constant/response.code")

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
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong!',
        data: {},
    });
  }
};

const addWallet = async (req, res) => {
  try {
    const { wallet,collection_name,nft_name ,token_address} = req.body;
        if (!req.body || !wallet || !collection_name || !nft_name || !token_address)
            return res.status(HTTP.SUCCESS).send({
                status: false,
                code: HTTP.NOT_FOUND,
                message: 'All fields are required!',
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
            wallet,collection_name,nft_name ,token_address
        }).save();
        if (!walletData)
            return res.status(HTTP.SUCCESS).send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: 'Unable to save wallet data',
                data: {},
            });
        return res.status(HTTP.SUCCESS).send({
            status: true,
            code: HTTP.SUCCESS,
            message: 'wallet data.',
            data: {walletData},
        });
  } catch(err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong!',
        data: {},
    });
}
}

const getinfo = async (req, res) => {
  try{

    const wallet_data = await WalletUser.find({},{ _id: 0, __v: 0 })
    const nftRaffel_data = await Raffel.find({},{ _id: 0, __v: 0})
    const data = []
    data.push({ wallet_data, nftRaffel_data })
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: 'sara data',
      data: data ,
  });

  } catch(err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong!',
        data: {},
    });
  }
}

module.exports = { 
  newRaffel,
  addWallet,
  getinfo

};
