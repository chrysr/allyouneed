const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const cookieParser = require('cookie-parser');

module.exports = (param) =>{

    const {LoginService}=param;

    router.get("/",async(req,res,next) =>{
        console.log("loginloaded");
        //console.log(req.cookies);
        try {
            //const feedbacklist=await feedbackService.getlist();
            //console.log(process.cwd());
            //console.log("GET LOGIN");
            //console.log(req.cookies.loggedin);
            if(!req.cookies["loggedin"])
            {
                return res.render("login",{
                    page: "Login",
                    success:req.query.success,
                    loggedin:req.cookies.loggedin,
                    error:"",
                });

            }
            else{
              return res.redirect('/account');
            }
        }
        catch (err) {
            return err;
        }
    });

    router.post("/",async(req,res,next) =>{
        console.log("LOGIN-----------");
        try {
            var email,pass,signupemail,signuppass,fname,lname,phone,address,taxid,gender,type,country;
            email=(((req.body.email?req.body.email:null)?req.body.email.trim():null)?req.body.email.trim().toLowerCase():null);
            pass=((req.body.pass?req.body.pass:null)?req.body.pass.trim():null);
            signupemail=(((req.body.signupemail?req.body.signupemail:null)?req.body.signupemail.trim():null)?req.body.signupemail.trim().toLowerCase():null);
            signuppass=((req.body.signuppass?req.body.signuppass:null)?req.body.signuppass.trim():null);
            fname=((req.body.fname?req.body.fname:null)?req.body.fname.trim():null);
            lname=((req.body.lname?req.body.lname:null)?req.body.lname.trim():null);
            phone=((req.body.phone?req.body.phone:null)?req.body.phone.trim():null);
            address=((req.body.address?req.body.address:null)?req.body.address.trim():null);
            taxid=((req.body.taxid?req.body.taxid:null)?req.body.taxid.trim():null);
            gender=((req.body.gender?req.body.gender:null)?req.body.gender.trim():null);
            type=((req.body.type?req.body.type:null)?req.body.type.trim():null);
            country=((req.body.country?req.body.country:null)?req.body.country.trim():null);

            console.log("mail: "+email+" pass: "+pass+"\nsignup-email: "+signupemail+" signup-pass:"+signuppass+" fname: "+fname+" lname: "+lname+" telephone: "+phone+" address: "+address+" gender:"+gender+" taxid: "+taxid+" type: "+type);
            //console.log(User);
            console.log("country: "+ country);
            const db=req.app.locals.db;
            if(email!=null&&pass!=null&&signupemail==null&&signuppass==null&&fname==null&&lname==null&&phone==null&&address==null&&taxid==null&&gender==null&&type==null&&country==null) //login
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
                        return res.redirect('/login?success=false/reason=userdoesnotexist');
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
                        return res.redirect('/login?success=false');
                    }
                }).catch((err)=>{
                    console.log(err);
                }).finally(()=>{
                    //client.close();
                })
            }
            else if(signupemail!=null&&signuppass!=null&&fname!=null&&lname!=null&&address!=null&&taxid!=null&&gender!=null&&phone!=null&&type!=null&&country!=null&&email==null&&pass==null)
            {
                db.collection('users').find({email:signupemail}).toArray().then((docs) => {
                    console.log(docs+ " "+docs.length);
                    if(docs.length==1)
                    {
                        console.log("Signup Fail");
                        return res.redirect('/login?signup=false/reason=userexists');
                    }
                    else
                    {
                        var re = /\S+@\S+\.\S+/;
                        if(!re.test(String(signupemail)))
                        {
                            return res.redirect('/login?signup=false/reason=invalidmail');
                        }
                        re=/^\d+$/;
                        if(!re.test(String(phone)))
                        {
                            return res.redirect('/login?signup=false/reason=invalidphone');
                        }
                        var rating;
                        if(type=="Seller")
                        {
                            rating={
                                srating:0,
                                sratingnum:0,
                                brating:0,
                                bratingnum:0,
                            };
                        }
                        else if(type=="Bidder")
                        {
                            rating={
                                brating:0, 
                            }                            
                        }
                        
                        var entry={rating:rating,email:signupemail,password:bcrypt.hashSync(signuppass,bcrypt.genSaltSync(8),null),firstname:fname,lastname:lname,phone:phone,address:address,taxpayerid:taxid,gender:gender,type:type,country:country,isaccepted:false,resetPasswordToken:''};
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
            };
        }
        catch (err) {
            return next(err);
        }
    });

    return router;
};
