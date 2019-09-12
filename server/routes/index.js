const express = require("express");
const router = express.Router();
//const speakersroute = require("./speakers");
//const feedbackroute = require("./feedback");
const loginroute = require("./login");
const myaccountroute=require("./myaccount");

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
    
    //router.use("/speakers",speakersroute(param));
    //router.use("/feedback",feedbackroute(param));
    router.use("/login",loginroute(param));
    router.use("/account",myaccountroute(param))
    return router;
};