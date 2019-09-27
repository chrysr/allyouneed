const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');
const fs=require('fs');


module.exports = (param) =>{

    
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
        console.log("/createauction get");

        try {
            
            const db=req.app.locals.db;

            _id=req.cookies._id;
            if(!_id)
              return res.redirect('/');
            var person;
            await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
              person=docs[0];
            })
            if(person.type!='Seller')
              return res.redirect('/');
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
                });
            }
            else return res.redirect("/login");
        }
        catch (err) {
            return err;
        }

    });
    var multer = require('multer');
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads')
      },
      filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
      }
    });
    var upload = multer({storage: storage});
    function unique(arr) 
    { 
        var obj = {};
        for(i=0;i<arr.length;i++)
            obj[arr[i]]=arr[i];

        arr=[];
        for(key in obj)
            arr.push(obj[key])
        
        return arr;
    }
    router.post("/",upload.array('photo',4),async(req,res,next) =>{
        try {
          console.log('/createauction post');
          const db=req.app.locals.db;
          var shortname,name,categories,buy_price,starting_bid,bids_num;
          var location,country,start_date,end_date,description;
          var seller;

          var _id=req.cookies._id;
          await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
            seller=docs[0].email;
          })
          //name: Auction name given by the user
          name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
          //category: Category of the item.It could belong to multiple categories
          categories=[];
          if(Array.isArray(req.body.categories))
          {
            //console.log('array');
            for(var i=0;i<req.body.categories.length;i++)
            {
              if(req.body.categories[i]=='')
                continue;
              categories.push('allcats->'+req.body.categories[i]);
            }
          }
          else 
          {
            //console.log('not array');
            categories.push('allcats->'+req.body.categories);
          }
          console.log(categories);
          //buy_price: Price that if a buyer give, wins the item.seller may choose not to have such a price, so in this case the item is not included within the auction.
          buy_price=((req.body.buy_price?req.body.buy_price:null)?req.body.buy_price.trim():null);
          //starting_bid: Minimum bid (first bid) when the auction will start
          starting_bid=((req.body.starting_bid?req.body.starting_bid:null)?req.body.starting_bid.trim():null);
          if(buy_price==null)
            buy_price=0;
          //location: Geographical information of the object
          location=((req.body.location?req.body.location:null)?req.body.location.trim():null);
          //country: Country of the item
          country=((req.body.country?req.body.country:null)?req.body.country.trim():null);
          //start_date: Start time of the auction
          start_date=((req.body.start_date?req.body.start_date:null)?req.body.start_date.trim():null);
          //end_date: Auction expiry
          end_date=((req.body.end_date?req.body.end_date:null)?req.body.end_date.trim():null);
          //product_DescFull description of the object
          description=((req.body.description?req.body.description:null)?req.body.description.trim():null);
          date=new Date();
          now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
          date=new Date(end_date);
          end_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
          date=new Date(start_date);
          start_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

          if(end_date<=start_date) 
          {
            console.log('insert item error endsbeforestarts');
            return res.redirect('/createauction?success=false/reason=endsbeforestarts');
          }

          var re=/^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
          if(!re.test(String(name))){
              console.log('insert item error invalidname');
              return res.redirect('/createauction?success=false/reason=invalidname');
          }   
          if(parseFloat(buy_price)<parseFloat(starting_bid)&&parseFloat(buy_price)>0)
          {
            console.log('insert item error buylessthanstarting');

            return res.redirect('/createauction?success=false/reason=buylessthanstarting');
          }

          for(var i=2,flag=0;flag==0;i++)
          {
            shortname=name+makeid(i); 
            await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
              if(docs.length==0){
                flag=1;
              }
            });
          }
          //HANDLE FILES
          await fs.mkdirSync('./public/images/'+shortname,function(){
          });
          photos=[];
          for(var i=0;i<req.files.length;i++)
          {
            if((req.files[i].mimetype.endsWith("jpeg")) || (req.files[i].mimetype.endsWith("png")) || (req.files[i].mimetype.endsWith("jpg"))
            || (req.files[i].mimetype.endsWith("gif")) )
            {
              await fs.rename(req.files[i].path,'./public/images/'+shortname+"/"+shortname+"_"+(i+1)+".jpg",function(){
              })
              photos[i]=shortname+'_'+(i+1).toString()+'.jpg';
            }
          }
          //END HANDLE FILES
        
          tmp=categories;
          categories=[];
          for(i=0;i<tmp.length;i++)
          {
            categories.push(tmp[i]);
            s=tmp[i].split('->');
            for(j=1;j<s.length;j++)
            {
              var f=s[0];
              for(k=1;k<=j;k++)
              f=f+'->'+s[k];
              categories.push(f);                
            }
          }
          categories=unique(categories);
          entry={shortname:shortname,name:name,categories:categories,price:parseFloat(buy_price),starting_bid:parseFloat(starting_bid),
            bids:[],location:location,country:country,seller:seller,
            description:description,start_date:start_date,end_date:end_date,photo:photos}
          db.collection('products').insertOne(entry).then((docs)=>{
              console.log('New Item inserted');
              return res.redirect('/createauction?success=true');
          })
        }
        catch (err) {
            return next(err);
        }
    });

    return router;
};
