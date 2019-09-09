const express = require("express");
const router = express.Router();
const speakersroute = require("./speakers");
const feedbackroute = require("./feedback");
const loginroute = require("./login");


module.exports = (param) =>{

    const  {speakerService}  = param;

    router.get("/",async (req,res,next) =>{
        try {
            const promises =[];

            promises.push(speakerService.getlistshort());
            promises.push(speakerService.getartwork());
    
            const results = await Promise.all(promises);
    
            return res.render("index",{
                page:"Home",
                speakerslist: results[0],
                artwork: results[1],
            });
        } catch (err) {
            return next(err);
        }

    });
    router.use("/speakers",speakersroute(param));
    router.use("/feedback",feedbackroute(param));
    router.use("/login",loginroute(param));
    return router;
};