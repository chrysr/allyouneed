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
        console.log('/resetpass get');
        const db=req.app.locals.db;
        db.collection('users').find({resetPasswordToken:req.params.token}).toArray().then((docs)=>{
            res.render('resetpass', {token: req.params.token});
        })
    });
    
    router.post('/:token', function(req, res) {
        console.log('/resetpass post');
        async.waterfall([
        function(done) {
            const db=req.app.locals.db;
            db.collection('users').updateOne({"resetPasswordToken":req.params.token},{$set:{"password":bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(8))}}).then((docs)=>{
            })
            db.collection('users').updateOne({"resetPasswordToken":req.params.token},{$set:{"resetPasswordToken":''}}).then((docs)=>{
            })
            done('done');
        }], function(err) {
        res.redirect('/products');
        });
        console.log('resetpass successful');
    });
    return router;
};