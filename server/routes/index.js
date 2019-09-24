const express = require("express");
const router = express.Router();
//const speakersroute = require("./speakers");
//const feedbackroute = require("./feedback");
const loginroute = require("./login");
const myaccountroute=require("./myaccount");
const createauction=require("./createauction");
const sw = require('stopword');


module.exports = (param) =>{

    const  {productService}  = param;
    
    router.get("/products",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    
            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                //console.log(docs);
                return res.render("index",{
                page:"Home",
                productslist: docs,
                loggedin:req.cookies.loggedin,
                });
            })
            
        } catch (err) {
            return next(err);
        }

    });
    router.get("/",async (req,res,next) =>{
        res.redirect('/products');
    });
    router.get("/products/byascprice",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { price: 1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });
    router.get("/products/bydescprice",async (req,res,next) =>{
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { price: -1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });

    router.get("/products/endingsoonest",async (req,res,next) =>{ ////////////////////////////
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: 1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });

    router.get("/products/endinglatest",async (req,res,next) =>{ ////////////////////////////
        try {
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: -1 } ).toArray().then((docs)=>{

                //console.log(docs);
                return res.render("index",{
                    page:"Home",
                    productslist: docs,
                    loggedin:req.cookies.loggedin,
                });
            })   
            
        } catch (err) {
            return next(err);
        }

    });


    router.get("/products/bycategory",async (req,res,next) =>{
        try {
            //console.log("bycatget");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            var subcategories=[];
            await db.collection('categories').find({name:'allcats'}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;
                //console.log(subcategories);
            })
            products={};
            if(subcategories!=null)
            {
                for(i=0;i<subcategories.length;i++)
                {
                    s="allcats->"+subcategories[i];
                    await db.collection('products').find({categories:s,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((p)=>{
                        products[subcategories[i]]=p;
                    })
                }
            }
            //console.log("subcat");
            //console.log(subcategories);
            //console.log("products");
            //console.log(products);
        
            return res.render("category",{
                page:"Category",
                categories:subcategories,
                history:'allcats->',
                products,products,
                loggedin:req.cookies.loggedin,
            }); 
                          
        } catch (err) {
            return next(err);
        }

    });
    router.post("/products/bycategory",async (req,res,next) =>{
        try {
            //console.log("bycatpost");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            choice=((req.body.choice?req.body.choice:null)?req.body.choice.trim():null);
            history=((req.body.history?req.body.history:null)?req.body.history.trim():null);
            choice=history+choice;
            //console.log(choice);
            var subcategories=[];
            await db.collection('categories').find({name:choice}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;
                //console.log(subcategories);

            })
            var products={};
            if(subcategories!=null)
            {
                for(i=0;i<subcategories.length;i++)
                {
                    s=choice+"->"+subcategories[i];
                    //console.log(s);
                    //console.log(subcategories[i]);
                    await db.collection('products').find({categories:s,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((p)=>{
                        products[subcategories[i]]=p;
                    })
                }
            }
            //console.log("WILL NOT PRINT");
            //console.log(products);
            //console.log("subcat");
            //console.log(subcategories);
            //console.log("products");
            //console.log(products);
            return res.render("category",{
                page:"Category",
                categories:subcategories,
                history:choice+'->',
                products:products,
                loggedin:req.cookies.loggedin,
            });
            
        } catch (err) {
            return next(err);
        }

    });
    function unique(arr) 
    { 
        var obj = {};
        for(i=0;i<arr.length;i++)
            obj[arr[i]._id]=arr[i];

        arr=[];
        for(key in obj)
            arr.push(obj[key])
        
        return arr;
    }
    router.get("/products/search",async (req,res,next) =>{
        console.log("searchget");
    });
    router.post("/products/search",async (req,res,next) =>{
        try {
            search=((req.body.search?req.body.search:null)?req.body.search.trim():null);
            //console.log("searchpost|"+search+"|");
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            search=search.split(' ');
            search = sw.removeStopwords(search)

            products=[];
            for(i=0;i<search.length;i++)
            {
                //console.log("|"+search[i]+"|");
                await db.collection('products').find({name:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    //console.log(docs);
                    products.push.apply(products,docs)
                })   
                await db.collection('products').find({description:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    //console.log(docs);
                    products.push.apply(products,docs)
                })   
                var subcategories=[];
                await db.collection('categories').find({name:{$regex: search[i],$options: 'i'}}).toArray().then((docs)=>{
                    //console.log(docs);
                    subcategories=docs;        
                })   
                if(subcategories!=null)
                {
                    for(j=0;j<subcategories.length;j++)
                    {
                        //console.log(j);
                        //console.log(subcategories[j].name);
                        await db.collection('products').find({categories:subcategories[j].name,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                            //console.log(docs);
                            products.push.apply(products,docs);
                        })
                    }
                }
            }
            products=unique(products);
            
            console.log(products);
            return res.render("index",{
                page:"Home",
                productslist: products,
                loggedin:req.cookies.loggedin,
            });
                          
        } catch (err) {
            return next(err);
        }

    });
    

    router.get("/products/:shortname",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            var person={};
            person.email='';
            _id=req.cookies._id;
            if(_id)
            {
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    person=docs[0];
                });
            }
            var product;
            await db.collection('products').find({shortname:req.params.shortname}).toArray().then((docs)=>{
                //console.log(docs[0].photo.length);
                product=docs;
                //if(docs.length==0)
                    //return res.redirect('/products');
                //    return next();
                
            })   
            if(product.length==0)
                return res.redirect('/products');
            product=product[0];
            var seller;
            await db.collection('users').find({email:product.seller}).toArray().then((docs)=>{
                seller=docs[0];
            })
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            //console.log(now);  
            var categories;
            await db.collection('categories').find().toArray().then((docs)=>{
                categories=docs;
            })        
            for(i=0;i<categories.length;i++)
            {
              categories[i].name=categories[i].name.replace("allcats->",'');
            }
            categories=categories.slice(1);  
            return res.render("auctions",{
                page:req.params.name,
                product:product,
                loggedin:req.cookies.loggedin,
                now:now,
                person:person,
                seller:seller,
                categories:categories
            });      
              
        } 
        catch (err) {
            return next(err);
        }
        
    });
    function unique2(arr) 
    { 
        var obj = {};
        for(i=0;i<arr.length;i++)
            obj[arr[i]]=arr[i];

        arr=[];
        for(key in obj)
            arr.push(obj[key])
        
        return arr;
    }
    var multer = require('multer');

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads')
        },
        filename: (req, file, cb) => {
          cb(null, file.fieldname + '-' + Date.now())
        }
      });
    var upload = multer({storage: storage});
    const fs=require('fs');
    const path=require('path');
    router.post("/products/:shortname",upload.array('photo',4),async(req,res,next) =>{
        try {
            if(!req.cookies.loggedin)
                return res.redirect('/products/'+req.params.shortname+'?postnotloggedin');
            //DISABLE IN PUG FOR USER TO BE ABLE TO BID AFTER AUCTION HAS FINISHED
            const db=req.app.locals.db;
            shortname=((req.params.shortname?req.params.shortname:null)?req.params.shortname.trim():null);
            amount=((req.body.amount?req.body.amount:null)?req.body.amount.trim():null);
            srating=((req.body.srating?req.body.srating:null)?req.body.srating.trim():null);
            brating=((req.body.brating?req.body.brating:null)?req.body.brating.trim():null);
            //console.log("/products/shortname post "+shortname+" "+amount);
            name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
            buy_price=((req.body.buy_price?req.body.buy_price:null)?req.body.buy_price.trim():null);
            categories=[];
            for(var i=0;i<req.body.categories.length;i++)
            {
                if(req.body.categories[i]=='')
                continue;
                categories.push('allcats->'+req.body.categories[i]);
            }
            starting_bid=((req.body.starting_bid?req.body.starting_bid:null)?req.body.starting_bid.trim():null);
            location=((req.body.location?req.body.location:null)?req.body.location.trim():null);
            start_date=((req.body.start_date?req.body.start_date:null)?req.body.start_date.trim():null);
            end_date=((req.body.end_date?req.body.end_date:null)?req.body.end_date.trim():null);
            description=((req.body.description?req.body.description:null)?req.body.description.trim():null);
            _id=req.cookies._id;
            if(name!=null&&buy_price!=null&&starting_bid!=null&&location!=null&&start_date!=null&&end_date!=null&&description!=null)
            {
                console.log("the correct one");
                var product;
                await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                    product=docs[0];
                })
                if(product.bids.length>0)
                {
                    return res.redirect('/products/'+shortname+'?change=false/reason=a bid has been made');
                }
                date=new Date();
                now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                date=new Date(end_date);
                end_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                date=new Date(start_date);
                start_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                if(end_date<=start_date&&start_date>now) //check if that works
                {
                    console.log("ends before starts or equal");
                    return res.redirect('/createauction?success=false/reason=endsbeforestarts');
                }

                var re=/^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
                if(!re.test(String(name))){
                    return res.redirect('/createauction?success=false/reason=invalidname');
                }
                re=/^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/;
                if(!re.test(String(buy_price))){
                    return res.redirect('/createauction?success=false/reason=invalidbuy_price');
                }
                console.log("2starting_bid: "+typeof(starting_bid));
                console.log("2buy_price: "+typeof(buy_price));
                if(!re.test(String(starting_bid))){
                    return res.redirect('/createauction?success=false/reason=invalidstarting_bid');
                }
                console.log("starting bid: "+starting_bid);
                if(parseFloat(buy_price)<parseFloat(starting_bid))
                {
                    return res.redirect('/createauction?success=false/reason=buylessthanstarting');
                }
                photos=[];
                const sleep=require('sleep');
                if(req.files.length>0)
                {
                    console.log('handle pics');
                    //sleep.sleep(5);
                    files=[];
                    await fs.readdir('./public/images/'+shortname, (err, fil) => {
                        if (err) throw err;
                        for (file of fil)
                            files.push(file);
                        
                    });
                    for (const file of files) {
                        console.log(file);
                        await fs.unlink(path.join('./public/images/'+shortname, file), err => {
                        if (err) throw err;
                        });
                    }
                    console.log('removed all');
                    //sleep.sleep(5);
                    for(var i=0;i<req.files.length;i++)
                    {
                        if((req.files[i].mimetype.endsWith("jpeg")) || (req.files[i].mimetype.endsWith("png")) || (req.files[i].mimetype.endsWith("jpg"))
                        || (req.files[i].mimetype.endsWith("gif")) )
                        {
                        console.log(req.files[i].mimetype);
                        console.log("it's ok")
                        await fs.rename(req.files[i].path,'./public/images/'+shortname+"/"+shortname+"_"+(i+1)+".jpg",function(){
                        })
                            photos[i]=shortname+'_'+(i+1).toString()+'.jpg';
                        }
                    }
                }
                
                console.log('doneee');
                tmp=categories;
                categories=[];
                for(i=0;i<tmp.length;i++)
                {
                    categories.push(tmp[i]);
                    s=tmp[i].split('->');
                    for(j=1;j<s.length;j++)
                    {
                    var f=s[0];
                    for(k=1;k<=j;k++)
                    f=f+'->'+s[k];
                    categories.push(f);                
                    }
                }
                categories=unique2(categories);
                var photos;
                if(photos.length>0)
                {
                    entry={shortname:shortname,name:name,categories:categories,price:parseFloat(buy_price),starting_bid:parseFloat(starting_bid),
                        location:location,
                        description:description,start_date:start_date,end_date:end_date,photo:photos}
                }
                else
                {
                    entry={shortname:shortname,name:name,categories:categories,price:parseFloat(buy_price),starting_bid:parseFloat(starting_bid),
                        location:location,
                        description:description,start_date:start_date,end_date:end_date}
                }
                console.log(entry);
                await db.collection('products').updateOne({shortname:shortname},{$set:entry}).then((docs)=>{
                })
                return res.redirect('/products/'+shortname);


            }
            
            else
            {
                var person;
                var item;
                if (srating!=null||brating!=null)
                {
                    var product;
                    await db.collection('products').find({shortname:req.params.shortname}).toArray().then((docs)=>{
                        product=docs[0];
                    })
                    if(srating!=null)
                    {
                        //console.log("srating");
                        await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{brate:true}})
                        var rating;
                        var newrate;
                        await db.collection('users').find({email:product.seller}).toArray().then((docs)=>{
                            rating=docs[0].rating;
                        })
                        newrate=rating.srating*rating.sratingnum;
                        rating.sratingnum++;
                        rating.srating=(newrate+parseInt(srating))/rating.sratingnum;
                        //console.log(rating);
                        db.collection('users').updateOne({email:product.seller},{$set:{rating:rating}});
                        
                    }
                    if(brating!=null)
                    {
                        //console.log("brating");
                        await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{srate:true}})
                        var newrate;
                        var rating;
                        await db.collection('users').find({email:product.bids[product.bids.length-1].bidder}).toArray().then((docs)=>{
                            rating=docs[0].rating;
                        })
                        newrate=rating.brating*rating.bratingnum;
                        rating.bratingnum++;
                        rating.brating=(newrate+parseInt(brating))/rating.bratingnum;
                        //console.log(rating);
                        db.collection('users').updateOne({email:product.bids[product.bids.length-1].bidder},{$set:{rating:rating}});
                        
                    }
                    res.redirect('/products/'+req.params.shortname);
                }
                else
                {
                    await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                        person=docs[0];
                    });
                    await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                        item=docs[0];
                    });
                    bids=item.bids;
                    //console.log(item);
                    if(bids.length==0&&parseFloat(amount)<item.starting_bid)
                        return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothigherthanfirst');
                    if(bids.length>0&&(bids[bids.length-1].amount>=parseFloat(amount)))
                        return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothighenough');
                    date=new Date();
                    now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                    //console.log(now);
                    if(now<item.start_date||now>item.end_date)
                        return res.redirect('/products/'+shortname+'?postbutauctionhasended');
                    bid={};
                    bid['amount']=parseFloat(amount);
                    bid['bidder']=person.email;
                    date=new Date();
                    bid['time']=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                    //console.log(bid);    
                    bids.push(bid);
                    end=item.end_date;
                    if(parseFloat(amount)>=item.price)
                    {
                        end=bid['time'];
            
                        //buynow
                        //finalize auction etc
                    }

                    await db.collection('products').updateOne({shortname:shortname},{$set: {bids:bids,end_date:end}}).then((docs)=>{
                        //console.log("okay to db");
                    });      
                    res.redirect('/products/'+shortname+'?bidplace=success');
                }
            }
        } 
        catch (err) {
            return next(err);
        }
        
    });
    router.get("/account/accept/:who",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').updateOne({email:req.params.who},{$set: {isaccepted:true}}).then((docs)=>{
                        return res.redirect('/account');                
                    });
                }
            });
        }
        catch (err) {
            return next(err);
        }
        
    });
    router.get("/account/reject/:who",async(req,res,next) =>{
        try {
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').deleteOne({email:req.params.who}).then((docs)=>{
                        return res.redirect('/account');                
                    });
                }     
            });       
        } 
        catch (err) {
            return next(err);
        }
        
    });

    
    //router.use("/speakers",speakersroute(param));
    //router.use("/feedback",feedbackroute(param));
    router.use("/login",loginroute(param));
    router.use("/account",myaccountroute(param));
    router.use('/createauction',createauction(param));
    return router;
};