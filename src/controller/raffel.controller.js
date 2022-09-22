const Raffel = require("../model/raffel.model");
const WalletUser = require("../model/wallet.model");
const Transaction = require("../model/transaction.model")
const HTTP = require("../constant/response.constant");

const addWallet = async (req, res) => {
  try {
    const { wallet, collection_name, nfts} = req.body;

    if (!req.body || !wallet || !collection_name || !nfts ) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "All fields are required!", data: {}});

    const walletExists = await WalletUser.findOne({ wallet });
    if (walletExists) return res.status(HTTP.SUCCESS).send({ success: false, code: HTTP.BAD_REQUEST, message: 'Wallet already exists with same name!', data: {}, });

    
    const walletData = await new WalletUser({
      wallet,
      collection_name,
      nfts
    }).save();
    
    if (!walletData) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Unable to save wallet data", data: {}, });
    
    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message:  "wallet data.", data: {  }, });

  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const createRaffel = async (req, res) => {
  try {
    const { raffel_end_date, url, ticket_supply, ticket_price, token_address } = req.body;

    // const url_check = await Raffel.find({ url });
    // if (!url_check) return res.status(200).send({ data: "data already added" });

    const user = await new Raffel({
      raffel_end_date,
      url,
      ticket_supply,
      ticket_remaining: ticket_supply,
      ticket_price,
      token_address,
    }).save();

    if (!user)  return res.status(200).send({ data: "not found" }); 

    return res.status(200).send({ data: user });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};


const getinfo = async (req, res) => {
  try {
    const wallet_data = await WalletUser.find({}, { _id: 0, __v: 0 });
    const nftRaffel_data = await Raffel.find({}, { _id: 0, __v: 0 });
    // const walletData = [];
    // const nftRaffelData = [];

    // for (let i = 0; i < wallet_data.length; i++) {
    //   walletData.push(wallet_data[i]);
    // }
    // for (let i = 0; i < nftRaffel_data.length; i++) {
    //   nftRaffelData.push(nftRaffel_data[i]);
    // }
    // convert stringify
    // const json = JSON.stringify(walletData);
    // const json1 = JSON.stringify(nftRaffelData);
    
    // convert json
    const obj = JSON.parse(JSON.stringify(wallet_data));
    const obj1 = JSON.parse(JSON.stringify(nftRaffel_data));
    // Combine
    const mergeById = (array1, array2) =>
      array1.map((itm) => ({
        ...array2.find((item) => item.token_address === itm.token_address && item),
        ...itm,
      }));

    const result = mergeById(obj, obj1);

    console.log(mergeById(obj, obj1));
    



    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "get data", data: result });
    
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const buyTicket = async (req, res) => {
  try { 
    
    const { buyers_wallet, token_address, quantity } = req.body
    if( !buyers_wallet ||  !token_address || !quantity ) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "all fields are required! ", data: {} })

    // buyer cannot buy its own token
    const checkSeller = await WalletUser.find({ token_address })
    for(const data of checkSeller) {
      if( buyers_wallet === data.wallet ) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "seller cannot buy its own ticket!", data: {} })
    }

    // check quantity in Raffel model 
    const checkQuantity = await Raffel.find({ token_address })
    if(!checkQuantity) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "no data available", data: {} })
 
    for(const data of checkQuantity) {
      if( quantity > data.ticket_remaining ) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "quantity is exceding!", data: {} })
      
      // deduct from ticket_remaining
      let remaining = data.ticket_remaining - quantity
       
      //  update in raffel -> ticket remaining
      const update = await Raffel.findOneAndUpdate({ token_address }, { ticket_remaining: remaining })
      if(!update) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not update ticket remaining!", data: {} })
      
    }
    
    // if the buyer_wallet has already bought the same token then just update it
    const already_bought = await Transaction.find({ buyers_wallet, token_address })
    for(const data of already_bought) {
      
      let new_quantity = parseFloat(data.quantity) + parseFloat(quantity)
      let update_quantity = await Transaction.findOneAndUpdate({ _id: data._id }, { quantity: new_quantity })
      if(!update_quantity) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not update quantity!", data: {} })


      return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "data updated successfully.", data: {} });
    }
    
    // add to transaction model
    const addTransaction = await new Transaction({ buyers_wallet, quantity, token_address  }).save()
    if(!addTransaction) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not add the current transaction!", data: {} })
    
    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "new data added.", data: {} });

  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const checkRemaining = async (req, res) => {
  try {

    const {token} = req.body
    const tickets = await Raffel.find({ token_address: token })
    for(const data of tickets) {
      if(data.ticket_remaining > 0) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_ALLOWED, message: "still tickets remaining", data: {} })
    }

    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "0 tickets remaining", data: {} });
    
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
};

const participants = async (req, res) => {
  try {

    const { token_address } = req.body
    const buyers = await Transaction.find({ token_address }, {_id: 0, __v: 0, token_address: 0}).sort({ quantity: -1 })
    let result = []
    for(const data of buyers) {
      result.push({ wallet: data.buyers_wallet, quantity: data.quantity})
    }

    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "participants data:", result });
    
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
};

const ticketRemaining = async (req, res) => {
  try {
    const { token_address } =req.body
    const data = await Raffel.find({ token_address }, { ticket_remaining: 1, _id: 0})

    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "tickets remaining:", data });
  } catch(err){
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
}

const getAllData = async (req, res) => {
  try {

    const wallet = await WalletUser.find({})
    const raffel = await Raffel.find({})

    let result = []
    for(const data of wallet) {

    }


  } catch(err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
}

module.exports = {
  createRaffel,
  addWallet,
  getinfo,
  
  buyTicket,
  ticketRemaining,
  checkRemaining,
  participants,
  getAllData

};
