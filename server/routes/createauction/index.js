const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');

//console.log(process.cwd());


module.exports = (param) =>{

    //const {feedbackService}=param;
    //const {LoginService}=param;
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    router.get("/",async(req,res,next) =>{
        console.log("loginloaded");
        //console.log(req.cookies);

        try {
            //const feedbacklist=await feedbackService.getlist();
            //console.log(process.cwd());
            //console.log("GET LOGIN");
            //console.log(req.cookies.loggedin);
            if(req.cookies["loggedin"])
            {
                return res.render("createauction",{
                    page: "Crate Auction",
                    success:req.query.success,
                    loggedin:req.cookies.loggedin,

                    //feedbacklist,
                    //success: req.query.success,
                });
            }
            else return res.redirect("/login");
        }
        catch (err) {
            return err;
        }

    });

    router.post("/",async(req,res,next) =>{
        console.log("came here");
        try {
          var count=0;
          const db=req.app.locals.db;
          var shortname,name,category,currently,buy_price,starting_bid,bids_num,bids;
          var bid,bidder,time,amount,location,country,started,ends,seller,product_descr;
          //name: Auction name given by the user
          name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
          //category: Category of the item.It could belong to multiple categories
          category=((req.body.category?req.body.category:null)?req.body.category.trim():null);
          //currently: The current best deal in dollars. It's always equal to higher bid or with First_Bid if no bids have been submitted.
          currently=0;
          //buy_price: Price that if a buyer give, wins the item.seller may choose not to have such a price, so in this case the item is not included within the auction.
          buy_price=((req.body.buyprice?req.body.buyprice:null)?req.body.buyprice.trim():null);
          //starting_bid: Minimum bid (first bid) when the auction will start
          starting_bid=((req.body.startingbid?req.body.startingbid:null)?req.body.startingbid.trim():null);
          //bids_num: Number of bids
          bids_num=((req.body.bidnum?req.body.bidnum:null)?req.body.bidnum.trim():null);
          //bidder: Information about the bidder: UserID,Ratting,Location,Country
          bidder=((req.body.bids?req.body.bids:null)?req.body.bids.trim():null);
          //kai na gemizei afth sto database ---> bids

          //time: Concerns the time of submission bid. Must be after starting time and before end time
          time=((req.body.time?req.body.time:null)?req.body.time.trim():null);
          //amount: The amount of the offer
          amount=((req.body.amount?req.body.amount:null)?req.body.amount.trim():null);
          //location: Geographical information of the object
          location=((req.body.location?req.body.location:null)?req.body.location.trim():null);
          //country: Country of the item
          country=((req.body.country?req.body.country:null)?req.body.country.trim():null);
          //started: Start time of the auction
          started=((req.body.started?req.body.started:null)?req.body.started.trim():null);
          //ends: Auction expiry
          ends=((req.body.ends?req.body.ends:null)?req.body.ends.trim():null);
          //seller: seller's UserID,seller's Rating.A user has a different rating as a seller and as a bidder.
          seller=((req.body.seller?req.body.seller:null)?req.body.seller.trim():null);
          //product_DescFull description of the object
          product_descr=((req.body.product_descr?req.body.product_descr:null)?req.body.product_descr.trim():null);
          for(var i=2,flag=0;flag==0;i++)
          {
            shortname=name+makeid(i); //unique id for the item
            await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
              if(docs.length==0){
                flag=1;
              }
            });
          }
          entry={shortname:shortname,name:name,category:category,currently:currently,
            buy_price:buy_price,starting_bid:starting_bid,bids_num:bids_num,bids:bids,
            bid:bid,bidder:bidder,time:time,amount:amount,location:location,
            country:country,started:started,ends:ends,seller:seller,product_descr:product_descr,
            date:new Date()}
          db.collection('products').insertOne(entry).then((docs)=>{
              console.log("product inserted successfully");
              res.redirect('/createauction?success=true');
          })
      }
      catch (err) {
          return next(err);
      }
    });

    return router;
};
