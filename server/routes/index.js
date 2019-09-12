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
            const promises =[];

            promises.push(productService.getlist());
            const results = await Promise.all(promises);
    
            return res.render("index",{
                page:"Home",
                productslist: results[0],
                loggedin:req.cookies.loggedin,
            });
        } catch (err) {
            return next(err);
        }

    });
    router.get("/",async (req,res,next) =>{
        res.redirect('/products');
    });

    router.get("/products/byprice",async (req,res,next) =>{
        try {
            const promises =[];

            promises.push(productService.sortbyprice());
            promises.push(productService.categorieslist());
            const results = await Promise.all(promises);
    
            return res.render("index",{
                page:"Home",
                productslist: results[0],
                loggedin:req.cookies.loggedin,
            });
        } catch (err) {
            return next(err);
        }

    });
    


    router.get("/products/:shortname",async(req,res,next) =>{
        try {
            const promises =[];

            promises.push(productService.getproduct(req.params.shortname));
    
            const results = await Promise.all(promises);

            if (!results[0]){
                return next();
            }
            return res.render("auctions",{
                page:req.params.name,
                product:results[0],
                loggedin:req.cookies.loggedin,
            });
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