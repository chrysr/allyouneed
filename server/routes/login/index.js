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
            var email,pass,signupemail,signuppass,fname,lname;
            if (typeof req.body.email != 'undefined' && req.body.email) 
            {    
                email=req.body.email.trim();
                email=email.toLowerCase();
            }
            else email=null;
            if (typeof req.body.pass != 'undefined' && req.body.pass) 
                pass=req.body.pass.trim();
            else pass=null;
            if (typeof req.body.signupemail != 'undefined' && req.body.signupemail) 
            {    
                signupemail=req.body.signupemail.trim();
                signupemail=signupemail.toLowerCase();
            }
            else signupemail=null;
            if (typeof req.body.signuppass != 'undefined' && req.body.signuppass) 
                signuppass=req.body.signuppass.trim();
            else signuppass=null;
            if (typeof req.body.fname != 'undefined' && req.body.fname) 
                fname=req.body.fname.trim();
            else fname=null;
            if (typeof req.body.lname != 'undefined' && req.body.lname) 
                lname=req.body.lname.trim();
            else lname=null;
            console.log("mail: "+email+" pass: "+pass+"\nsignup-email: "+signupemail+" signup-pass:"+signuppass+" fname: "+fname+" lname: "+lname);
            console.log(User);
            const mongo = require('mongodb');
            const MongoClient = mongo.MongoClient;
            const url = 'mongodb://localhost:27017';
            var success=0;
            MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if (err) throw err;
                const db = client.db("login");
                if(email!=null&&pass!=null&&signupemail==null&&signuppass==null&&fname==null&&lname==null)
                {
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
                }
                else if(signupemail!=null&&signuppass!=null&&fname!=null&&lname!=null&&email==null&&pass==null)
                {
                    console.log("Should sign up");
                    db.listCollections().toArray().then((docs) => {
                        console.log('Available collections:');
                        docs.forEach((doc, idx, array) => { console.log(doc.name) });
                        db.collection('users').find({email:email}).toArray().then((docs) => {
                            console.log(docs+ " "+docs.length);  
                            if(docs.length==1) 
                            {
                                console.log("Signup Fail");
                                return res.redirect('/login?signup=false');
                            }
                            else
                            {
                                var entry={email:signupemail,password:signuppass,firstname:fname,lastname:lname};
                                db.collection('users').insertOne(entry).then((docs)=>{
                                    console.log("Signup Success");
                                    //client.close();
                                    return res.redirect('/login?signup=success');
        
                                }).catch((err)=>{
                                    console.log(err);
                                }).finally(()=>{
                                    //client.close();
                                })

                                
                            }
                        }).catch((err) => {          
                            console.log(err);
                        }).finally(() => {      
                            //client.close();
                        });
                    }).catch((err) => {
                        console.log(err);
                    }).finally(() => {

                        //client.close();
                    });
                }
            });
        } 
        catch (err) {
            return next(err);
        }
    });

    return router;
};