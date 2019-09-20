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
            db.collection('products').find().toArray().then((docs)=>{
                console.log(docs);
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
            db.collection('products').find().sort( { price: 1 } ).toArray().then((docs)=>{

                console.log(docs);
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
            db.collection('products').find().sort( { price: -1 } ).toArray().then((docs)=>{

                console.log(docs);
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
            db.collection('products').find().sort( { ends: -1 } ).toArray().then((docs)=>{

                console.log(docs);
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
            db.collection('products').find().sort( { ends: 1 } ).toArray().then((docs)=>{

                console.log(docs);
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
            console.log("bycatget");
            const db=req.app.locals.db;
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
                    await db.collection('products').find({categories:s}).toArray().then((p)=>{
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
            console.log("bycatpost");
            const db=req.app.locals.db;
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
                    await db.collection('products').find({categories:s}).toArray().then((p)=>{
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
            console.log("searchpost|"+search+"|");
            const db=req.app.locals.db;
            search=search.split(' ');
            search = sw.removeStopwords(search)

            products=[];
            for(i=0;i<search.length;i++)
            {
                console.log("|"+search[i]+"|");
                await db.collection('products').find({name:{$regex: search[i],$options: 'i'}}).toArray().then((docs)=>{
                    //console.log(docs);
                    products.push.apply(products,docs)
                })   
                await db.collection('products').find({description:{$regex: search[i],$options: 'i'}}).toArray().then((docs)=>{
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
                        await db.collection('products').find({categories:subcategories[j].name}).toArray().then((docs)=>{
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
            db.collection('products').find({shortname:req.params.shortname}).toArray().then((docs)=>{
                console.log("here");
                console.log(docs[0].photo.length);
                if(docs.length==0)
                    return next();
                return res.render("auctions",{
                    page:req.params.name,
                    product:docs[0],
                    loggedin:req.cookies.loggedin,
                });
            })               
        } 
        catch (err) {
            return next(err);
        }
        
    });
    router.post("/products/:shortname",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            console.log("/products/shortname post "+req.body.shortname);     
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