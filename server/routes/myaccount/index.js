const express = require("express");
const router = express.Router();


module.exports = (param) =>{

    const {MyaccountService}=param;

    router.get("/",async(req,res,next) =>{
        try {
            //console.log(req.cookies);
            if(req.cookies.loggedin)
            {
                return res.render("myaccount",{
                    page: "My Account",
                    loggedin:req.cookies.loggedin,
                });
            }
            //else console.log("NOT LOGGED IN AND TRIED TO GO TO ACCOUNT");
        } 
        catch (err) {
            return err;
        }
        
    });
    router.post("/",async(req,res,next) =>{
        //console.log("loginloaded");
        //console.log(req.cookies);

        try {
            //console.log("LOGOUT");
            //console.log(res.cookie.loggedin);
            res.clearCookie("loggedin");
            //console.log(res.cookie.loggedin);
            return res.redirect("/");
        } 
        catch (err) {
            return err;
        }
        
    });

    return router;
};