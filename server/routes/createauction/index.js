const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');

//console.log(process.cwd());


module.exports = (param) =>{

    //const {feedbackService}=param;
    //const {LoginService}=param;
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
            const db=req.app.locals.db;
            var description,name,shortname,startingbid,increment;
            description=((req.body.description?req.body.description:null)?req.body.description.trim():null);
            name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
            //shortname=((req.body.shortname?req.body.shortname:null)?req.body.shortname.trim():null);
            startingbid=((req.body.startingbid?req.body.startingbid:null)?req.body.startingbid.trim():null);
            increment=((req.body.increment?req.body.increment:null)?req.body.increment.trim():null);

            for(i=2, flag=0;flag==0;i++)
            {
                shortname=name+makeid(i);
                db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                    if(docs.length==0)
                        flag=1;
                });
            }
            entry={description:description,name:name,date:new Date(),shortname:shortname,price:startingbid}
            db.collection('products').insertOne(entry).then((docs)=>{
                console.log("product inserted successfully");
                res.redirect('/createauction?success=true');
            })

        
                
        } 
        catch (err) {
            return next(err);
        }
    });

    return router;
};