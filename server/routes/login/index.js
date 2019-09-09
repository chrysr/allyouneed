const express = require("express");
const router = express.Router();


module.exports = (param) =>{

    //const {feedbackService}=param;

    router.get("/",async(req,res,next) =>{
        try {
            //const feedbacklist=await feedbackService.getlist();
            return res.render("login",{
                page: "Login",
                //feedbacklist,
                //success: req.query.success,
            });
        } 
        catch (err) {
            return err;
        }
        
    });
    router.post("/",async(req,res,next) =>{
        try {
            const fbname=req.body.fbname.trim();
            const fbtitle=req.body.fbtitle.trim();
            const fbmessage=req.body.fbmessage.trim();
            const feedbacklist=await feedbackService.getlist();
            if(!fbmessage||!fbname||!fbtitle){
                return res.render("feedback",{
                    page: "Feedback",
                    error:true,
                    fbname,
                    fbmessage,
                    fbtitle,
                    feedbacklist
                });
            }
            await feedbackService.addentry(fbname,fbtitle,fbmessage);
            return res.redirect(`/feedback?success=true`);
        } 
        catch (err) {
            return next(err);
        }
    });

    return router;
};