const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');



module.exports = (param) =>{

    const {MyaccountService}=param;
    
    function unique(arr) 
    { 
        var obj = {};
        for(i=0;i<arr.length;i++)
            obj[arr[i]]=arr[i];

        arr=[];
        for(key in obj)
            arr.push(obj[key])
        
        return arr;
    }
    router.get("/",async(req,res,next) =>{
        try {
            console.log('/account get');
            if(req.cookies.loggedin)
            {
                const db=req.app.locals.db;
                var _id=req.cookies._id;
                var details,sent,received,myproducts
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    if(docs.length==0)
                    {
                        console.log('/account get error invalidcookie');
                        return res.redirect('/account?getfailed/reason=invalidcookie');
                    }
                    details=docs[0];
                })
                await db.collection('messages').find({sender:details.email.toString()}).sort({date:-1}).toArray().then((docs)=>{
                    sent=docs;
                })
                await db.collection('messages').find({receiver:details.email.toString()}).sort({date:-1}).toArray().then((docs)=>{
                    received=docs;
                })
                await db.collection('products').find({seller:details.email.toString()}).sort({end_date:-1}).toArray().then((docs)=>{
                    myproducts=docs;
                })
                db.collection('messages').updateMany({receiver:details.email.toString()},{$set:{seen:true}});
                date=new Date();
                now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                var contacts=[]
                if(details.type=='admin')
                {
                    await db.collection('users').find().toArray().then((docs)=>{
                        for(i=0;i<docs.length;i++)
                            contacts.push(docs[i].email);
                    })
                    var boughtbyme=[];
                    await db.collection('products').find({'bids.bidder':details.email,end_date:{$lt:now}},{bids:{$slice: -1}}).toArray().then((docs)=>{
                        boughtbyme=docs;
                    })
                    db.collection('users').find().sort({isaccepted:1}).toArray().then((all)=>{
                        return res.render("myaccount",{
                            page: "My Account",
                            loggedin:req.cookies.loggedin,
                            details:details,
                            all:all,
                            sent:sent,
                            received:received, 
                            myproducts:myproducts, 
                            contacts:contacts, 
                            now:now,  
                            boughtbyme:boughtbyme,                                   
                        });
                    })
                }
                else
                {
                    contacts.push('admin@allyouneed.com');
                    await db.collection('products').find({seller:details.email}).toArray().then((docs)=>{
                        for(i=0;i<docs.length;i++)
                        {
                            if(docs[i].bids.length>0)
                                contacts.push(docs[i].bids[docs[i].bids.length-1].bidder)
                        }
                    })
                    var boughtbyme=[];
                    await db.collection('products').find({'bids.bidder':details.email},{bids:{$slice: -1}}).toArray().then((docs)=>{
                        boughtbyme=docs;
                        for(i=0;i<docs.length;i++)
                            contacts.push(docs[i].seller);
                    })
                    contacts=unique(contacts);
                    return res.render("myaccount",{
                        page: "My Account",
                        loggedin:req.cookies.loggedin,
                        details:details,
                        sent:sent,
                        received:received, 
                        myproducts:myproducts, 
                        contacts:contacts,
                        now:now,          
                        boughtbyme:boughtbyme,                        
                    });
                }                            
            }
        } 
        catch (err) {
            return err;
        }
        
    });
    router.post("/",async(req,res,next) =>{
        console.log("/account post ");
        const d=req.app.locals.db;

        try {
            var email,pass,fname,lname,phone,address,taxid,gender,oldpass,recepient,message,country;
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
            country=((req.body.country?req.body.country:null)?req.body.country.trim():null);

            activateshortname=((req.body.activateshortname?req.body.activateshortname:null)?req.body.activateshortname.trim():null);
            const db=req.app.locals.db;

            if(activateshortname==null&&country!=null&&recepient==null&&message==null&&oldpass!=null&&email!=null&&fname!=null&&lname!=null&&phone!=null&&address!=null&&taxid!=null)
            {
                console.log("account changeinfo");
                var re = /\S+@\S+\.\S+/;
                if(!re.test(String(email)))
                {
                    console.log('account error invalidmail')
                    return res.redirect('/account?changedetails=false/reason=invalidmail');
                }
                var _id=req.cookies._id;
                var oldemail;
                var hash;
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{                        
                    console.log("inside");

                    if(docs.length==0)
                    {
                        console.log("account error Change Details Fail wrong id");
                        return res.redirect('/account?changedetails=false/reason=iddoesnotexist');
                    }
                    oldemail=docs.map(a=>a.email).toString();
                    hash=docs.map(a=>a.password).toString()
                    if(gender==null)
                        gender=docs.map(a=>a.gender.toString());
                });
                if(!bcrypt.compareSync(oldpass,hash))
                {
                    console.log("account error oldpassword incorrect");
                    return res.redirect('/account?changedetails=false/reason=oldpasswordincorrect');
                }
                if(oldemail!=email)
                {
                    await db.collection('users').find({email:email}).toArray().then((docs)=>{ //an yparxei apo allon                       
                        if(docs.length==1)
                        {
                            console.log("/account error mailexists");
                            return res.redirect('/account?changedetails=false/reason=mailexists');
                        }
                    }).catch((err) => {          
                        console.log(err);
                    }).finally(() => {      
                    });
                }
                if(pass==null)
                {
                    var entry={email:email,password:hash,firstname:fname,lastname:lname,phone:phone,address:address,taxpayerid:taxid,gender:gender,country:country};
                    db.collection('users').updateOne({"_id":require('mongodb').ObjectID(_id.toString())},{$set: entry}).then((docs)=>{
                        console.log("account Update one Success wnull");
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
                        console.log("account Update one Success notnull");
                        return res.redirect('/account?changedetailswpass=success');

                    }).catch((err)=>{
                        console.log(err);
                    }).finally(()=>{
                    })      
                }
            }
            else if(activateshortname==null&&country==null&&recepient!=null&&message!=null&&oldpass==null&&email==null&&fname==null&&lname==null&&phone==null&&address==null&&taxid==null)
            {
                console.log("/account for message");
                var re = /\S+@\S+\.\S+/;
                if(!re.test(String(recepient)))
                {
                    console.log('account error invalidmail');
                    return res.redirect('/account?message=false/reason=invalidmail');
                }
                db.collection('users').find({email:recepient}).toArray().then((docs)=>{
                    if(docs.length==0)
                    {
                        console.log('account error userdoesnotexist');
                        return res.redirect('/account?message=false/reason=userdoesnotexist');
                    }
                    else if(docs.length>1)
                    {
                        console.log("account error DUPLICATE USER ERROR");
                        return res.redirect('/account?message=false/reason=duplicateuser');
                    }
                    db.collection('users').find({"_id":require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((send)=>{
                        if(send.length==0)
                            return res.redirect('/account?message=false/reason=cookiedoesnotexist');
                        else if(send.length>1)
                            return res.redirect('/account?message=false/reason=multiplecookies');
                        entry={sender:send[0].email,receiver:recepient,content:message,date:new Date().toLocaleString(),seen:false};
                        db.collection('messages').insertOne(entry).then((docs)=>{
                            console.log("account message sent");
                            return res.redirect('/account?message=success');
                        })
                    });
                    
                })
            }
            else if(activateshortname==null&&country==null&&recepient==null&&message==null&&oldpass==null&&email==null&&fname==null&&lname==null&&phone==null&&address==null&&taxid==null)
            {
                res.clearCookie("loggedin");
                res.clearCookie("_id");
                console.log('account logout');
                return res.redirect("/");
            }
            else if(activateshortname!=null)
            {
                console.log('account activaet product');
                date=new Date();
                now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                await db.collection('products').updateOne({shortname:activateshortname},{$set:{start_date:now}});
                return res.redirect('/account');
            }
        } 
        catch (err) {
            return err;
        }
        
    });
    

    return router;
};