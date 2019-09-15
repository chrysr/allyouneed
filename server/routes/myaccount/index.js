const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');



module.exports = (param) =>{

    const {MyaccountService}=param;
    
        
    router.get("/",async(req,res,next) =>{
        try {
            if(req.cookies.loggedin)
            {
                const db=req.app.locals.db;
                var _id=req.cookies._id;
                console.log(_id);
                db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    //console.log(docs);
                    if(docs.length==0)
                        return res.redirect('/account?getfailed/reason=invalidcookie');
                    db.collection('messages').find({sender:docs[0].email.toString()}).toArray().then((sent)=>{
                        //console.log(sent);
                        db.collection('messages').find({receiver:docs[0].email.toString()}).toArray().then((received)=>{
                            //console.log(received);
                            db.collection('messages').updateMany({receiver:docs[0].email.toString()},{$set:{seen:true}});
                            if(docs[0].type=='admin')
                            {
                                db.collection('users').find().sort({isaccepted:1}).toArray().then((all)=>{
                                    //console.log(all);
                                    return res.render("myaccount",{
                                        page: "My Account",
                                        loggedin:req.cookies.loggedin,
                                        details:docs[0],
                                        all:all,
                                        sent:sent,
                                        received:received,                                        
                                    });
                                })
                            }
                            else
                            {
                                //console.log(sent);
                                //console.log(received);
                                return res.render("myaccount",{
                                    page: "My Account",
                                    loggedin:req.cookies.loggedin,
                                    details:docs[0],
                                    sent:sent,
                                    received:received,                                    
                                });
                            }
                        })
                        })
                    })
                            

            
                
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
        console.log("POST @ MYACCOUNT");
        const d=req.app.locals.db;

        try {
            var email,pass,fname,lname,phone,address,taxid,gender,oldpass,recepient,message;
            email=(((req.body.email?req.body.email:null)?req.body.email.trim():null)?req.body.email.trim().toLowerCase():null);
            pass=((req.body.pass?req.body.pass:null)?req.body.pass.trim():null);
            fname=((req.body.fname?req.body.fname:null)?req.body.fname.trim():null);
            lname=((req.body.lname?req.body.lname:null)?req.body.lname.trim():null);
            phone=((req.body.phone?req.body.phone:null)?req.body.phone.trim():null);
            address=((req.body.address?req.body.address:null)?req.body.address.trim():null);
            taxid=((req.body.taxid?req.body.taxid:null)?req.body.taxid.trim():null);
            gender=((req.body.gender?req.body.gender:null)?req.body.gender.trim():null);
            oldpass=((req.body.oldpass?req.body.oldpass:null)?req.body.oldpass.trim():null);
            recepient=((req.body.recepient?req.body.recepient:null)?req.body.recepient.trim():null);
            message=((req.body.message?req.body.message:null)?req.body.message.trim():null);

            //console.log("LOGOUT");
            //console.log(res.cookie.loggedin);
            const db=req.app.locals.db;
            console.log("mail: "+email+" pass: "+pass+" old pass: "+oldpass+" fname: "+fname+" lname: "+lname+" telephone: "+phone+" address: "+address+" gender:"+gender+" taxid: "+taxid);

            if(recepient==null&&message==null&&oldpass!=null&&email!=null&&fname!=null&&lname!=null&&phone!=null&&address!=null&&taxid!=null)
            {
                var re = /\S+@\S+\.\S+/;
                if(!re.test(String(email)))
                {
                    return res.redirect('/account?changedetails=false/reason=invalidmail');
                }
                re=/^\d+$/;
                if(!re.test(String(phone)))
                {
                    return res.redirect('/account?changedetails=false/reason=invalidphone');
                }
                var _id=req.cookies._id;
                var oldemail;
                var hash;
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{                        
                    console.log("inside");

                    if(docs.length==0)
                    {
                        console.log("Change Details Fail wrong id");
                        return res.redirect('/account?changedetails=false/reason=iddoesnotexist');
                    }
                    oldemail=docs.map(a=>a.email).toString();
                    hash=docs.map(a=>a.password).toString()
                    if(gender==null)
                        gender=docs.map(a=>a.gender.toString());
                });
                if(!bcrypt.compareSync(oldpass,hash))
                {
                    console.log("Change Details Fail");
                    return res.redirect('/account?changedetails=false/reason=oldpasswordincorrect');
                }
                if(oldemail!=email)
                {
                    await db.collection('users').find({email:email}).toArray().then((docs)=>{ //an yparxei apo allon                       
                        if(docs.length==1)
                        {
                            console.log("Change Details Fail mailexists");
                            return res.redirect('/account?changedetails=false/reason=mailexists');
                        }
                    }).catch((err) => {          
                        console.log(err);
                    }).finally(() => {      
                    });
                }
                if(pass==null)
                {
                    var entry={email:email,password:hash,firstname:fname,lastname:lname,phone:phone,address:address,taxpayerid:taxid,gender:gender};
                    db.collection('users').updateOne({"_id":require('mongodb').ObjectID(_id.toString())},{$set: entry}).then((docs)=>{
                        console.log("Update one Success wnull");
                        return res.redirect('/account?changedetailsnopass=success');

                    }).catch((err)=>{
                        console.log(err);
                    }).finally(()=>{
                    })      
                }
                else
                {
                    var entry={email:email,password:bcrypt.hashSync(pass,bcrypt.genSaltSync(8),null),firstname:fname,lastname:lname,phone:phone,address:address,taxpayerid:taxid,gender:gender};
                    db.collection('users').updateOne({"_id":require('mongodb').ObjectID(_id.toString())},{$set: entry}).then((docs)=>{
                        console.log("Update one Success notnull");
                        return res.redirect('/account?changedetailswpass=success');

                    }).catch((err)=>{
                        console.log(err);
                    }).finally(()=>{
                    })      
                }
            }
            else if(recepient!=null&&message!=null&&oldpass==null&&email==null&&fname==null&&lname==null&&phone==null&&address==null&&taxid==null)
            {
                console.log("/account for message");
                var re = /\S+@\S+\.\S+/;
                if(!re.test(String(recepient)))
                {
                    return res.redirect('/account?message=false/reason=invalidmail');
                }
                db.collection('users').find({email:recepient}).toArray().then((docs)=>{
                    if(docs.length==0)
                        return res.redirect('/account?message=false/reason=userdoesnotexist');
                    else if(docs.length>1)
                    {
                        console.log("DUPLICATE USER ERROR");
                        return res.redirect('/account?message=false/reason=duplicateuser');
                    }
                    db.collection('users').find({"_id":require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((send)=>{
                        if(send.length==0)
                            return res.redirect('/account?message=false/reason=cookiedoesnotexist');
                        else if(send.length>1)
                            return res.redirect('/account?message=false/reason=multiplecookies');
                        entry={sender:send[0].email,receiver:recepient,content:message,date:new Date().toLocaleString(),seen:false};
                        db.collection('messages').insertOne(entry).then((docs)=>{
                            console.log("message sent");
                            return res.redirect('/account?message=success');
                        })
                    });
                    
                })
            }
            else if(recepient==null&&message==null&&oldpass==null&&email==null&&fname==null&&lname==null&&phone==null&&address==null&&taxid==null)
            {
                res.clearCookie("loggedin");
                res.clearCookie("_id");
                return res.redirect("/");
            }
        } 
        catch (err) {
            return err;
        }
        
    });
    

    return router;
};