const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var async = require("async");
module.exports = (param) =>{
    const {LoginService}=param;
    router.get('/:token', function(req, res) {
        const db=req.app.locals.db;
        console.log(req.params.token);

        db.collection('users').find({resetPasswordToken:req.params.token}).toArray().then((docs)=>{
            res.render('resetpass', {token: req.params.token});
        })
    });
    
    router.post('/:token', function(req, res) {
        async.waterfall([
        function(done) {
            //console.log(req.params.token);  
            const db=req.app.locals.db;
            db.collection('users').updateOne({"resetPasswordToken":req.params.token},{$set:{"password":bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(8))}}).then((docs)=>{
                //console.log("Update one Success");
            })
            db.collection('users').updateOne({"resetPasswordToken":req.params.token},{$set:{"resetPasswordToken":undefined}}).then((docs)=>{
               // console.log("Update one Success");
            })
            done('done');
        }], function(err) {
        res.redirect('/products');
        });
    });
/*
    router.post("/",async(req,res,next) =>{
        console.log("recover pass-----------");
        try {
            var email;
            email=(((req.body.email?req.body.email:null)?req.body.email.trim():null)?req.body.email.trim().toLowerCase():null);
       
            console.log("mail: "+emai);
            //console.log(User);
            const db=req.app.locals.db;
            if(email!=null) 
            {
                var re = /\S+@\S+\.\S+/;
                if(!re.test(String(email)))
                {
                    res.status(500).send({error:"email"});
                    return res.redirect('/login?success=false/reason=invalidmail');
                }
                db.collection('users').find({email:email}).toArray().then((docs)=>{
                    if(docs.length>1)
                    {
                        console.log("DUPLICATE USER");
                    }
                    else if(docs.length==0)
                    {
                        console.log("mailnotindb")
                        return res.redirect('/login?success=false/reason=userdoesnotexist');//alagesssssssssss
                    }
                    //console.log(docs);
                    var data=pass;
                    var hash=docs.map(a=>a.password).toString();
                    console.log(hash+" "+data);
                    if(bcrypt.compareSync(data,hash))
                    {
                        if(docs[0].isaccepted==true)
                        {
                            console.log("Login Success ");
                            var _id=docs.map(a=>a._id);
                            //console.log(typeof(_id));

                            //console.log("My id is: "+_id);
                            res.clearCookie('loggedin');
                            res.clearCookie('_id');
                            res.cookie('loggedin',true);
                            res.cookie('_id',_id);
                            return res.redirect('/');
                        }
                        else
                        {
                            return res.redirect('/login?success=false?reason=accountnotactivated');
                        }
                    }
                    else
                    {
                        console.log("Login Fail");
                        return res.redirect('/forgotpass?success=false');
                    }
                }).catch((err)=>{
                    console.log(err);
                }).finally(()=>{
                    //client.close();
                })
            }
        }
        catch (err) {
            return next(err);
        }
    }); */
    return router;
};