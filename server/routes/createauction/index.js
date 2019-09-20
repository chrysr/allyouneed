const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');
const fs=require('fs');
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
        console.log("createauctionloaded");
        //console.log(req.cookies);

        try {
            //const feedbacklist=await feedbackService.getlist();
            //console.log(process.cwd());
            //console.log("GET LOGIN");
            //console.log(req.cookies.loggedin);
            categories=[];
            const db=req.app.locals.db;
            await db.collection('categories').find().toArray().then((docs)=>{
              categories=docs;
            })
            for(i=0;i<categories.length;i++)
            {
              categories[i].name=categories[i].name.replace("allcats->",'');
            }
            categories=categories.slice(1);
            if(req.cookies["loggedin"])
            {
                return res.render("createauction",{
                    page: "Create Auction",
                    success:req.query.success,
                    loggedin:req.cookies.loggedin,
                    categories:categories,
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

    /*var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './uploads')
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
      }
    });*/
    var multer = require('multer');
    //var upload = multer({ dest: './uploads' });
    //const upload = multer({
    //    dest: './uploads/' // this saves your file into a directory called "uploads"
    //});
   // var upload = multer({ storage: storage })
    //const upload = multer({dest: 'uploads/'});
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads')
      },
      filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
      }
    });
    var upload = multer({storage: storage});
    router.post("/",upload.array('photo',5),async(req,res,next) =>{
        try {
          const db=req.app.locals.db;
          var shortname,name,category,buy_price,starting_bid,bids_num;
          var location,country,started,ends,description;
          var seller={};
          var smins,shour,emins,ehour;
          smins=((req.body.smins?req.body.smins:null)?req.body.smins.trim():null);
          shour=((req.body.shour?req.body.shour:null)?req.body.shour.trim():null);
          emins=((req.body.emins?req.body.emins:null)?req.body.emins.trim():null);
          ehour=((req.body.ehour?req.body.ehour:null)?req.body.ehour.trim():null);
          var _id=req.cookies._id;
          await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
            seller['email']=docs[0].email;
            seller['srating']=docs[0].rating.srating;
          })
          //name: Auction name given by the user
          name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
          //category: Category of the item.It could belong to multiple categories
          category=((req.body.category?req.body.category:null)?req.body.category.trim():null);
          if(category!=null)
            category="allcats->"+category;
          //buy_price: Price that if a buyer give, wins the item.seller may choose not to have such a price, so in this case the item is not included within the auction.
          buy_price=((req.body.buy_price?req.body.buy_price:null)?req.body.buy_price.trim():null);
          //starting_bid: Minimum bid (first bid) when the auction will start
          starting_bid=((req.body.starting_bid?req.body.starting_bid:null)?req.body.starting_bid.trim():null);
          //bids_num: Number of bids
          //bids_num=((req.body.bids_num?req.body.bids_num:null)?req.body.bids_num.trim():null);

          /* AFTA EDW NA MPOUN EKEI POU THA KANEI BID O USER
          //currently: The current best deal in dollars. It's always equal to higher bid or with First_Bid if no bids have been submitted.
          currently=0;
          //bidder: Information about the bidder: UserID,Rating,Location,Country   tha pigenei ston array of the bidders
          bidder=((req.body.ALLAGHHHH?req.body.bids:null)?req.body.bids.trim():null);
          //time: Concerns the time of submission bid. Must be after starting time and before end time
          time=((req.body.time?req.body.time:null)?req.body.time.trim():null);
          //amount: The amount of the offer
          amount=((req.body.amount?req.body.amount:null)?req.body.amount.trim():null);
          //seller: seller's UserID,seller's Rating.A user has a different rating as a seller and as a bidder.
          seller=((req.body.seller?req.body.seller:null)?req.body.seller.trim():null);
          */

          //location: Geographical information of the object
          location=((req.body.location?req.body.location:null)?req.body.location.trim():null);
          //country: Country of the item
          country=((req.body.country?req.body.country:null)?req.body.country.trim():null);
          //started: Start time of the auction
          started=((req.body.started?req.body.started:null)?req.body.started.trim():null);
          //ends: Auction expiry
          ends=((req.body.ends?req.body.ends:null)?req.body.ends.trim():null);
          //product_DescFull description of the object
          description=((req.body.description?req.body.description:null)?req.body.description.trim():null);
          console.log(name+" "+category+" "+buy_price+" "+starting_bid);
          console.log("started: "+started);
          console.log("ended: "+ends);
          
          console.log("createauction category "+category);
          console.log("create auction "+shour+" "+smins+" "+ehour+" "+emins);
          var parts=started.split('-');
          startfull=new Date(parts[0],parts[1]-1,parts[2],shour.toString(),smins.toString());
          parts=ends.split('-');
          endfull=new Date(parts[0],parts[1]-1,parts[2],ehour.toString(),emins.toString());
          console.log(startfull+" "+endfull);
          now =new Date();
          if(endfull<=startfull&&startfull>now)
          {
            console.log("ends before starts or equal");
            res.redirect('/createauction?success=false/reason=endsbeforestarts');
          }

          var re =/^[a-zA-Z]([._-]?[a-zA-Z0-9]+)*$/; //start with letter/s. end not a special character.
          //just letter or number.dot or dash or underline,must be separated by letters or numbers
          if(!re.test(String(name))){
              return res.redirect('/createauction?success=false/reason=invalidname');
          }
          re=/^\d+$/;
          if(!re.test(String(buy_price))){
              return res.redirect('/createauction?success=false/reason=invalidbuy_price');
          }
          if(!re.test(String(starting_bid))){
              return res.redirect('/createauction?success=false/reason=invalidstarting_bid');
          }
          //category--->  PREPEI NA ELEGXOUME OTI EDOSE ESTW ENA
          /*re =/^[a-zA-Z0-9]$/;
          if(!re.test(String(location))){ /*CHECK TI THA KANOUME ME AFTO
              return res.redirect('/createauction?success=false/reason=invalidlocation');
          }
          if(!re.test(String(country))){
              return res.redirect('/createauction?success=false/reason=invalidcountry');
          }*/
          if(buy_price>=starting_bid)
          {
            return res.redirect('/createauction?success=false/reason=buylessthanstarting');
          }
          
          

          for(var i=2,flag=0;flag==0;i++)
          {
            shortname=name+makeid(i); //unique id for the item
            await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
              if(docs.length==0){
                flag=1;
              }
            });
          }
          //HANDLE FILES
          photos=[];
          for(var i=0;i<req.files.length;i++)
          {
            if(i==0)
            {
              await fs.mkdirSync('./public/images/'+shortname,function(){
              });
            }
            await fs.rename(req.files[i].path,'./public/images/'+shortname+"/"+shortname+"_"+(i+1)+".jpg",function(){
            })
            photos[i]=shortname+'_'+(i+1).toString()+'.jpg';

          }
          //END HANDLE FILES

          entry={shortname:shortname,name:name,category:category,price:parseFloat(buy_price),starting_bid:starting_bid,
            bids_num:0,location:location,country:country,seller:seller,
            description:description,startdate:startfull,enddate:endfull,photo:photos}
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
