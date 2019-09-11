const express = require("express");
const router = express.Router();
const speakersroute = require("./speakers");
const feedbackroute = require("./feedback");
const loginroute = require("./login");

module.exports = (param) =>{

    const  {productService}  = param;

    router.get("/",async (req,res,next) =>{
        try {
            const promises =[];

            promises.push(productService.getlist());
            const results = await Promise.all(promises);
    
            return res.render("index",{
                page:"Home",
                productslist: results[0],
            });
        } catch (err) {
            return next(err);
        }

    });

    router.get("/byprice",async (req,res,next) =>{
        try {
            const promises =[];

            promises.push(productService.sortbyprice());
            promises.push(productService.categorieslist());
            const results = await Promise.all(promises);
    
            return res.render("index",{
                page:"Home",
                productslist: results[0],
            });
        } catch (err) {
            return next(err);
        }

    });
    


    router.get("/:shortname",async(req,res,next) =>{
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
            });
        } 
        catch (err) {
            return next(err);
        }
        
    });

    router.use("/speakers",speakersroute(param));
    router.use("/feedback",feedbackroute(param));
    router.use("/login",loginroute(param));
    return router;
};