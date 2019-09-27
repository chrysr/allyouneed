const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var async = require("async");
module.exports = (param) =>{
    //const {LoginService}=param;
    router.get("/",async(req,res,next) =>{
        console.log('/forgotpass get');
        try {
            if(!req.cookies["loggedin"]) {
                return res.render("forgotpass",{
                    page: "Forgotpass",
                    success:req.query.success,
                    loggedin:req.cookies.loggedin,
                    error:"",
                });

            }
            else{
              return res.redirect('/products');
            }
        }
        catch (err) {
            return err;
        }
    });
    router.post('/', function(req, res, next) {
        console.log('/forgotpass post');
        async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err,token);
            });
        },
        function(token,done) {
            const db=req.app.locals.db;
            var email;
            email=(((req.body.email?req.body.email:null)?req.body.email.trim():null)?req.body.email.trim().toLowerCase():null);
            db.collection('users').find({email:email}).toArray().then((docs)=>{
                if(docs.length<1) {
                    console.log('forgotpass error usernotfound');
                    return res.redirect('/forgotpass?requestnew=false/reason=usernotfound');
                }
                db.collection('users').updateOne({"email":email},{$set:{"resetPasswordToken":token}}).then((docs)=>{
                }).catch((err)=>{
                }).finally(()=>{
                })     
            }).catch((err) => {          
            }).finally(() => {    
            });
            done(null,token);
        },
        function(token, done) {
            var email;
            email=(((req.body.email?req.body.email:null)?req.body.email.trim():null)?req.body.email.trim().toLowerCase():null);
            var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: 'alallyouneed@gmail.com',
                pass: "allyouneed1234"  
            }
            });
            var mailOptions = {
            to: email, 
            from: 'alallyouneed@gmail.com',
            subject: 'Allyouneed Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                ((req.app.locals.ssl)?('https'):('http'))+'://'+req.app.locals.ip.toString()+':3000/resetpass/' + token + '\n\n' +  
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');         
                done(err, 'done');
            });
        }
        ], function(err) {
            if (err){
                return next(err);
            }
            console.log('forgotpass procedure successful');
            res.redirect('/forgotpass?requestnew=true');
        });
    });

    return router;
};

