const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');

//console.log(process.cwd());


module.exports = (param) =>{

    //const {feedbackService}=param;
    //const {LoginService}=param;

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
        } 
        catch (err) {
            return err;
        }
        
    });
    
    router.post("/",async(req,res,next) =>{
        try {
                         
                
        } 
        catch (err) {
            return next(err);
        }
    });

    return router;
};