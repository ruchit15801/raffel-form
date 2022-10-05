const Raffel = require("../model/raffel.model");
const SellerWallet = require("../model/sellerWallet.model");
const Participant = require("../model/participant.model")
const Transaction = require("../model/transaction.model")
const Winner = require("../model/winner.model")
const HTTP = require("../constant/response.constant");
const axios = require("axios");

const addRaffel = async (req, res) => {
  try {
    const { wallet, collection_name, nft_name, token_address} = req.body;

    if (!req.body || !wallet || !collection_name || !nft_name || !token_address ) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "All fields are required!", data: {}});

    // check if same token and wallet have been saved
    const checkData = await SellerWallet.findOne({ $and: [{ wallet }, { token_address }] })
    if(checkData) return res.status(HTTP.SUCCESS).send({ success: false, code: HTTP.BAD_REQUEST, message: 'Wallet already exists with same token address!', data: {}, });

    // const walletExists = await SellerWallet.findOne({ wallet });
    // if (walletExists) return res.status(HTTP.SUCCESS).send({ success: false, code: HTTP.BAD_REQUEST, message: 'Wallet already exists with same name!', data: {}, });

    
    const walletData = await new SellerWallet({
      wallet,
      collection_name,
      nft_name,
      token_address
    }).save();
    
    if (!walletData) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Unable to save wallet data", data: {}, });
    
    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message:  "added raffel data.", data: {  }, });

  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const createRaffel = async (req, res) => {
  try {
    const { raffel_end_date, url, ticket_supply, ticket_price, token_address, wallet_address } = req.body;

    // const url_check = await Raffel.find({ url });
    // if (!url_check) return res.status(200).send({ data: "data already added" });
    const check = await Raffel.findOne({ $and: [{token_address}, { wallet_address }] })
    if(check) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "already created!", data: {}, });

    const user = await new Raffel({
      raffel_end_date,
      url,
      ticket_supply,
      ticket_remaining: ticket_supply,
      ticket_price,
      token_address,
      wallet_address
    }).save();

    if (!user) return res.status(200).send({ data: "not found" }); 

    return res.status(200).send({ data: user });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const getinfo = async (req, res) => {
  try {
    const wallet_data = await SellerWallet.find({}, { _id: 0, __v: 0 });
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

    // check if status is false



    const endpoint = "https://public-api-test.solscan.io/account/solTransfers?account=" + buyers_wallet + "&limit=1&offset=0"
    // const endpoint = `https://public-api-test.solscan.io/account/solTransfers?account=${{buyers_wallet}}&limit=1&offset=0`

    axios.get(endpoint).then(async (response) => {
      const transactionList = response.data.data
      // console.log(transactionList)
      for(const data of transactionList) {
        if(data.status == "Fail") return res.status(HTTP.BAD_REQUEST).send({ status: false, code: HTTP.NOT_ALLOWED, message: "Transaction failed", data: {} })

        if(data.status == "Success" ){
          // save to database
          // console.log("---------------IN SUCCESS----------------")
          const txnData = await new Transaction({ buyers_wallet, src: data.src, txHash: data.txHash, blockTime: data.blockTime, totalTickes: quantity}).save()
          if(!txnData) return res.status(HTTP.BAD_REQUEST).send({ status: false, code: HTTP.NOT_ALLOWED, message: "could not add txn to db", data: {} })
        }
        
      } 

      
    }).catch((error) => {
      console.log(error);
      return res.status(HTTP.BAD_REQUEST).send({ status: false, code: HTTP.NOT_ALLOWED, message: "could not find wallet address", data: {} })
    });

    
    
    
    // buyer cannot buy its own token
    const checkSeller = await SellerWallet.find({ token_address })
    for(const data of checkSeller) {
      if( buyers_wallet === data.wallet ) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "seller cannot buy its own ticket!", data: {} })
    }
    
    // check quantity in Raffel model 
    let price = 0
    const checkQuantity = await Raffel.find({ token_address })
    if(!checkQuantity) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "no data available", data: {} })
    
    // buyer cannot buy more than 20% nft
    let exceedAmt = 0 
    for(const data of checkQuantity) {
      exceedAmt = data.ticket_supply * 0.2
    }
    
    for(const data of checkQuantity) {
      if( quantity > data.ticket_remaining || quantity > exceedAmt) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "quantity is exceding!", data: {} })
      
      // deduct from ticket_remaining
      let remaining = data.ticket_remaining - quantity
      
      //  update in raffel -> ticket remaining
      const update = await Raffel.findOneAndUpdate({ token_address }, { ticket_remaining: remaining })
      if(!update) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not update ticket remaining!", data: {} })
      
      price = data.ticket_price * quantity
      
    }
    
    // if the buyer_wallet has already bought the same token then just update it
    const already_bought = await Participant.find({ buyers_wallet, token_address })
    for(const data of already_bought) {
      
      let new_quantity = parseFloat(data.quantity) + parseFloat(quantity)
      let new_price = parseFloat(data.price) + parseFloat(price)
      
      // console.log("price -----------------")
      // console.log(price)
      // console.log("new_price -----------------")
      // console.log(new_price)
      
      // console.log(exceedAmt)
      if(new_quantity > exceedAmt) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "quantity is exceding!", data: {} })
      
      let update_quantity = await Participant.findOneAndUpdate({ _id: data._id }, { quantity: new_quantity, price: new_price})
      if(!update_quantity) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not update quantity!", data: {} })
      
      
      return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "data updated successfully.", data: {} });
    }
    
    // add to participant model
    const addParticipant = await new Participant({ buyers_wallet, price, quantity, token_address  }).save()
    if(!addParticipant) return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.NOT_ALLOWED, message: "could not add the current participant!", data: {} })
    
    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "new data added.", data: {} });

    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "for checking!!!!!!!!!!!!!", data: {} });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {}, });
  }
};

const checkRemaining = async (req, res) => {
  try { 

    const { token } = req.body
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
    const buyers = await Participant.find({ token_address }, {_id: 0, __v: 0, token_address: 0}).sort({ quantity: -1 })
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

    // wallet status change


    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "tickets remaining:", data });
  } catch(err){
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
}

const getAllData = async (req, res) => {
  try {

    const wallet = await SellerWallet.find({})
    // const raffel = await Raffel.find({})

    let result = []
    for(const data of wallet) {
      // result.push({ wallet: data.wallet, collection_name: data.collection_name, nft_name: data.nft_name, token_address: data.token_address })
      let raffel = await Raffel.find({ token_address: data.token_address })
      for(const d of raffel) {
        result.push({ wallet: data.wallet, collection_name: data.collection_name, nft_name: data.nft_name, token_address: data.token_address, raffel_end_date: d.raffel_end_date, url: d.url, ticket_supply: d.ticket_supply, ticket_remaining: d.ticket_remaining, ticket_price: d.ticket_price,  })
      }
    }

    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "all data",  result });

  } catch(err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
}

const getWinner = async (req, res) => {
  try{
    const { token_address } = req.body
    
    // const countParticipants = await Participant.find({token_address}).count()
    // console.log("---------total participants---------")
    // console.log(countParticipants)
    // console.log("-----------random-----------")
    // console.log(Math.floor(Math.random() * countParticipants) + 1)

    // check winner model
    const check = await Winner.findOne({ token_address })
    if(check) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "winner already generated.", data: {} })
 
    const random = await Participant.aggregate([
      { $match: { token_address } },
      { $sample: { size: 1 } }
    ])
    if(!random) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "something went wrong while getting winner.", data: {} })
    
    // save winner to model
    for(const data of random){

      const saveWinner = await new Winner({ buyers_wallet: data.buyers_wallet, token_address: data.token_address }).save()

      if(!saveWinner) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "could not save data to database.", data: {} })
    }

    // change seller model status to false
    const sellerWalletUpdate = await SellerWallet.findOneAndUpdate({ token_address }, {status: false})
    if(!sellerWalletUpdate) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "could not update seller wallet.", data: {} })
    
    return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "winner ",  data: random });

  } catch(err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
  }
}


// const stopwatch = async (req, res) => {
//   try{


//   } catch(err) {
//     console.log(err);
//     return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR,  message: "Something went wrong!", data: {}, });
//   }
// }

module.exports = {
  createRaffel,
  addRaffel,
  getinfo,
  
  buyTicket,
  ticketRemaining,
  checkRemaining,
  participants,
  getAllData,
  getWinner,

  // stopwatch,
};
