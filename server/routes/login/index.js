const express = require("express");
const router = express.Router();
console.log(process.cwd());

const User = require('../../dbmodels/user');
const UserSession = require('../../dbmodels/usersession');

module.exports = (param) =>{

    //const {feedbackService}=param;
    const {LoginService}=param;

    router.get("/",async(req,res,next) =>{
        console.log("loginloaded");
        try {
            //const feedbacklist=await feedbackService.getlist();
            console.log(process.cwd());
            return res.render("login",{
                page: "Login",
                success:req.query.success,
                //feedbacklist,
                //success: req.query.success,
            });
        } 
        catch (err) {
            return err;
        }
        
    });
    router.post("/",async(req,res,next) =>{
        console.log("LOGIN---------------------------------------");
        try {
            const email=req.body.email.trim();
            const pass=req.body.pass.trim();
            console.log("mail: "+email+" pass: "+pass);
            console.log(User);
            const mongo = require('mongodb');
            const MongoClient = mongo.MongoClient;
            const url = 'mongodb://localhost:27017';
            var success=0;
            MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if (err) throw err;
                const db = client.db("login");
                db.listCollections().toArray().then((docs) => {
                    console.log('Available collections:');
                    docs.forEach((doc, idx, array) => { console.log(doc.name) });
                    db.collection('users').find({email:email,password:pass}).toArray().then((docs) => {
                        console.log(docs+ " "+docs.length);  
                        if(docs.length==1) 
                        {
                            console.log("Login Success");
                            return res.redirect('/login?success=true');
                        }
                        else
                        {
                            console.log("Login Fail");
                            return res.redirect('/login?success=false');
                        }
                    }).catch((err) => {          
                        console.log(err);
                    }).finally(() => {      
                        client.close();
                    });
                }).catch((err) => {
                    console.log(err);
                }).finally(() => {

                    client.close();
                });
            });
        } 
        catch (err) {
            return next(err);
        }
    });

    return router;
};