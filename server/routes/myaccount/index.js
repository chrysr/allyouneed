const express = require("express");
const router = express.Router();


module.exports = (param) =>{

    const {MyaccountService}=param;
    
        
    router.get("/",async(req,res,next) =>{
        try {
            if(req.cookies.loggedin)
            {
                const mongo = require('mongodb');
                const MongoClient = mongo.MongoClient;
                const url = 'mongodb://localhost:27017';
                MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                    if (err) throw err;
                    const db = client.db("allyouneed");
                    var _id=req.cookies._id;
                    console.log(_id);
                    db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                        console.log(docs);
                        return res.render("myaccount",{
                            page: "My Account",
                            loggedin:req.cookies.loggedin,
                            details:docs[0],
                            
                        });
                    }).catch((err)=>{
                        console.log(err);
                    }).finally(()=>{
                        client.close();
                    });
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
            res.clearCookie("_id");
            //console.log(res.cookie.loggedin);
            return res.redirect("/");
        } 
        catch (err) {
            return err;
        }
        
    });

    return router;
};