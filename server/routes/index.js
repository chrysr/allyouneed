const express = require("express");
const router = express.Router();
//const speakersroute = require("./speakers");
//const feedbackroute = require("./feedback");
const loginroute = require("./login");
const myaccountroute=require("./myaccount");
const createauction=require("./createauction");
const sw = require('stopword');


module.exports = (param) =>{

    const  {productService}  = param;
    
    router.get("/products",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    
            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                //console.log(docs);
                return res.render("index",{
                page:"Home",
                productslist: docs,
                loggedin:req.cookies.loggedin,
                });
            })
            
        } catch (err) {
            return next(err);
        }

    });
    router.get("/",async (req,res,next) =>{
        res.redirect('/products');
    });
    router.get("/products/byascprice",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { price: 1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });
    router.get("/products/bydescprice",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { price: -1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });

    router.get("/products/endingsoonest",async (req,res,next) =>{ ////////////////////////////
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: 1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });

    router.get("/products/endinglatest",async (req,res,next) =>{ ////////////////////////////
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: -1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });


    router.get("/products/bycategory",async (req,res,next) =>{
        try {
            //console.log("bycatget");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            var subcategories=[];
            await db.collection('categories').find({name:'allcats'}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;
                //console.log(subcategories);
            })
            products={};
            if(subcategories!=null)
            {
                for(i=0;i<subcategories.length;i++)
                {
                    s="allcats->"+subcategories[i];
                    await db.collection('products').find({categories:s,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((p)=>{
                        products[subcategories[i]]=p;
                    })
                }
            }
            //console.log("subcat");
            //console.log(subcategories);
            //console.log("products");
            //console.log(products);
        
            return res.render("category",{
                page:"Category",
                categories:subcategories,
                history:'allcats->',
                products,products,
                loggedin:req.cookies.loggedin,
            }); 
                          
        } catch (err) {
            return next(err);
        }

    });
    router.post("/products/bycategory",async (req,res,next) =>{
        try {
            //console.log("bycatpost");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            choice=((req.body.choice?req.body.choice:null)?req.body.choice.trim():null);
            history=((req.body.history?req.body.history:null)?req.body.history.trim():null);
            choice=history+choice;
            //console.log(choice);
            var subcategories=[];
            await db.collection('categories').find({name:choice}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;
                //console.log(subcategories);

            })
            var products={};
            if(subcategories!=null)
            {
                for(i=0;i<subcategories.length;i++)
                {
                    s=choice+"->"+subcategories[i];
                    //console.log(s);
                    //console.log(subcategories[i]);
                    await db.collection('products').find({categories:s,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((p)=>{
                        products[subcategories[i]]=p;
                    })
                }
            }
            //console.log("WILL NOT PRINT");
            //console.log(products);
            //console.log("subcat");
            //console.log(subcategories);
            //console.log("products");
            //console.log(products);
            return res.render("category",{
                page:"Category",
                categories:subcategories,
                history:choice+'->',
                products:products,
                loggedin:req.cookies.loggedin,
            });
            
        } catch (err) {
            return next(err);
        }

    });
    function unique(arr) 
    { 
        var obj = {};
        for(i=0;i<arr.length;i++)
            obj[arr[i]._id]=arr[i];

        arr=[];
        for(key in obj)
            arr.push(obj[key])
        
        return arr;
    }
    router.get("/products/search",async (req,res,next) =>{
        console.log("searchget");
    });
    router.post("/products/search",async (req,res,next) =>{
        try {
            search=((req.body.search?req.body.search:null)?req.body.search.trim():null);
            //console.log("searchpost|"+search+"|");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            search=search.split(' ');
            search = sw.removeStopwords(search)

            products=[];
            for(i=0;i<search.length;i++)
            {
                //console.log("|"+search[i]+"|");
                await db.collection('products').find({name:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    //console.log(docs);
                    products.push.apply(products,docs)
                })   
                await db.collection('products').find({description:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    //console.log(docs);
                    products.push.apply(products,docs)
                })   
                var subcategories=[];
                await db.collection('categories').find({name:{$regex: search[i],$options: 'i'}}).toArray().then((docs)=>{
                    //console.log(docs);
                    subcategories=docs;        
                })   
                if(subcategories!=null)
                {
                    for(j=0;j<subcategories.length;j++)
                    {
                        //console.log(j);
                        //console.log(subcategories[j].name);
                        await db.collection('products').find({categories:subcategories[j].name,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                            //console.log(docs);
                            products.push.apply(products,docs);
                        })
                    }
                }
            }
            products=unique(products);
            
            console.log(products);
            return res.render("index",{
                page:"Home",
                productslist: products,
                loggedin:req.cookies.loggedin,
            });
                          
        } catch (err) {
            return next(err);
        }

    });
    

    router.get("/products/:shortname",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            var person={};
            person.email='';
            _id=req.cookies._id;
            if(_id)
            {
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    person=docs[0];
                });
            }
            var product;
            await db.collection('products').find({shortname:req.params.shortname}).toArray().then((docs)=>{
                //console.log(docs[0].photo.length);
                product=docs[0];
                if(docs.length==0)
                    return next();
                
            })       
            var seller;
            await db.collection('users').find({email:product.seller}).toArray().then((docs)=>{
                seller=docs[0];
            })
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            //console.log(now);            
            return res.render("auctions",{
                page:req.params.name,
                product:product,
                loggedin:req.cookies.loggedin,
                now:now,
                person:person,
                seller:seller,
            });      
              
        } 
        catch (err) {
            return next(err);
        }
        
    });
    router.post("/products/:shortname",async(req,res,next) =>{
        try {
            if(!req.cookies.loggedin)
                return res.redirect('/products/'+req.body.shortname+'?postnotloggedin');
            //DISABLE IN PUG FOR USER TO BE ABLE TO BID AFTER AUCTION HAS FINISHED
            const db=req.app.locals.db;
            shortname=((req.body.shortname?req.body.shortname:null)?req.body.shortname.trim():null);
            amount=((req.body.amount?req.body.amount:null)?req.body.amount.trim():null);
            srating=((req.body.srating?req.body.srating:null)?req.body.srating.trim():null);
            brating=((req.body.brating?req.body.brating:null)?req.body.brating.trim():null);
            //console.log("/products/shortname post "+shortname+" "+amount);
            _id=req.cookies._id;
            var person;
            var item;
            if (srating!=null||brating!=null)
            {
                var product;
                await db.collection('products').find({shortname:req.params.shortname}).toArray().then((docs)=>{
                    product=docs[0];
                })
                if(srating!=null)
                {
                    //console.log("srating");
                    await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{brate:true}})
                    var rating;
                    var newrate;
                    await db.collection('users').find({email:product.seller}).toArray().then((docs)=>{
                        rating=docs[0].rating;
                    })
                    newrate=rating.srating*rating.sratingnum;
                    rating.sratingnum++;
                    rating.srating=(newrate+parseInt(srating))/rating.sratingnum;
                    //console.log(rating);
                    db.collection('users').updateOne({email:product.seller},{$set:{rating:rating}});
                    
                }
                if(brating!=null)
                {
                    //console.log("brating");
                    await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{srate:true}})
                    var newrate;
                    var rating;
                    await db.collection('users').find({email:product.bids[product.bids.length-1].bidder}).toArray().then((docs)=>{
                        rating=docs[0].rating;
                    })
                    newrate=rating.brating*rating.bratingnum;
                    rating.bratingnum++;
                    rating.brating=(newrate+parseInt(brating))/rating.bratingnum;
                    //console.log(rating);
                    db.collection('users').updateOne({email:product.bids[product.bids.length-1].bidder},{$set:{rating:rating}});
                    
                }
                res.redirect('/products/'+req.params.shortname);
            }
            else
            {
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    person=docs[0];
                });
                await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                    item=docs[0];
                });
                bids=item.bids;
                //console.log(item);
                if(bids.length==0&&parseFloat(amount)<item.starting_bid)
                    return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothigherthanfirst');
                if(bids.length>0&&(bids[bids.length-1].amount>=parseFloat(amount)))
                    return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothighenough');
                date=new Date();
                now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                //console.log(now);
                if(now<item.start_date||now>item.end_date)
                    return res.redirect('/products/'+shortname+'?postbutauctionhasended');
                bid={};
                bid['amount']=parseFloat(amount);
                bid['bidder']=person.email;
                date=new Date();
                bid['time']=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                //console.log(bid);    
                bids.push(bid);
                end=item.end_date;
                if(parseFloat(amount)>=item.price)
                {
                    end=bid['time'];
        
                    //buynow
                    //finalize auction etc
                }

                await db.collection('products').updateOne({shortname:shortname},{$set: {bids:bids,end_date:end}}).then((docs)=>{
                    //console.log("okay to db");
                });      
                res.redirect('/products/'+shortname+'?bidplace=success');
            }
        } 
        catch (err) {
            return next(err);
        }
        
    });
    router.get("/account/accept/:who",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').updateOne({email:req.params.who},{$set: {isaccepted:true}}).then((docs)=>{
                        return res.redirect('/account');                
                    });
                }
            });
        }
        catch (err) {
            return next(err);
        }
        
    });
    router.get("/account/reject/:who",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').deleteOne({email:req.params.who}).then((docs)=>{
                        return res.redirect('/account');                
                    });
                }     
            });       
        } 
        catch (err) {
            return next(err);
        }
        
    });

    
    //router.use("/speakers",speakersroute(param));
    //router.use("/feedback",feedbackroute(param));
    router.use("/login",loginroute(param));
    router.use("/account",myaccountroute(param));
    router.use('/createauction',createauction(param));
    return router;
};