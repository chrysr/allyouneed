const express = require("express");
const router = express.Router();
const loginroute = require("./login");
const myaccountroute=require("./myaccount");
const createauction=require("./createauction");
const sw = require('stopword');
const forgotpassroute = require("./forgotpass");
const resetpassroute = require("./resetpass");


module.exports = (param) =>{

    const  {productService}  = param;
    async function recommendation(itemsbought,db,user)
    {
        if(itemsbought.length==0)
            return [];
        const nn=require('nearest-neighbor');
        var fields=[
            {name: "name",measure:nn.comparisonMethods.word},
            {name: "categories",measure:nn.comparisonMethods.wordArray},
            {name: "location",measure:nn.comparisonMethods.word},
            {name: "description",measure:nn.comparisonMethods.word }
        ];
        var products;
        date=new Date();
        now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        await db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
            products=docs;
        })
        for(i=0;i<products.length;i++)
        {
            if(products[i].seller==user.email)
                continue;
            nn.findMostSimilar(products[i],itemsbought,fields,function(nearestNeighbor,probability){
                products[i]['prob']=probability;
            })
        }
        
        products.sort(function(a,b){
            return parseFloat(b['prob'])-parseFloat(a['prob']);
        });
        
        return products;
    };
    
    router.get("/products",async (req,res,next) =>{
        try {
            console.log('/products get');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            _id=req.cookies._id;
            var user;
            var recommend=[];
            if(_id)
            {
                await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                    user=docs[0];
                })
                await db.collection('products').find({'bids.bidder':user.email,end_date:{$lt:now}},{bids:{$slice: -1}}).toArray().then((docs)=>{
                    boughtbyme=docs;
                })
                recommend=await recommendation(boughtbyme,db,user);
            }
            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                docs.sort(function(a,b){
                    return b.bids.length-a.bids.length;
                })
                return res.render("index",{
                page:"Home",
                productslist: docs,
                loggedin:req.cookies.loggedin,
                recommend:recommend,
                initial:1,
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
            console.log('/products ascprice');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                for(i=0;i<docs.length;i++)
                {
                    if(docs[i].bids.length==0)
                        docs[i]['min']=docs[i].starting_bid;
                    else
                        docs[i]['min']=docs[i].bids[docs[i].bids.length-1].amount;
                }
                docs.sort(function(a,b){
                    return parseFloat(a['min'])-parseFloat(b['min']);
                });
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
            console.log('/products descprice');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                for(i=0;i<docs.length;i++)
                {
                    if(docs[i].bids.length==0)
                        docs[i]['min']=docs[i].starting_bid;
                    else
                        docs[i]['min']=docs[i].bids[docs[i].bids.length-1].amount;
                }
                docs.sort(function(a,b){
                    return parseFloat(b['min'])-parseFloat(a['min']);
                });
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

    router.get("/products/endingsoonest",async (req,res,next) =>{ 
        try {
            console.log('/products endingsoonest');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: 1 } ).toArray().then((docs)=>{

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

    router.get("/products/endinglatest",async (req,res,next) =>{ 
        try {
            console.log('/products endinglatest');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            db.collection('products').find({start_date:{$lte:now},end_date:{$gte:now}}).sort( { end_date: -1 } ).toArray().then((docs)=>{

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
            console.log('/products bycategory get');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            var subcategories=[];
            await db.collection('categories').find({name:'allcats'}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;
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
            console.log('/products bycategory post');
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            choice=((req.body.choice?req.body.choice:null)?req.body.choice.trim():null);
            history=((req.body.history?req.body.history:null)?req.body.history.trim():null);
            choice=history+choice;
            var subcategories=[];
            console.log(choice);
            console.log(history);
            await db.collection('categories').find({name:choice}).toArray().then((docs)=>{
                subcategories=docs[0].subcategories;

            })
            var products={};
            if(subcategories!=null)
            {
                for(i=0;i<subcategories.length;i++)
                {
                    s=choice+"->"+subcategories[i];
                    await db.collection('products').find({categories:s,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((p)=>{
                        products[subcategories[i]]=p;
                    })
                }
            }
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
    });
    router.post("/products/search",async (req,res,next) =>{
        try {
            console.log('/products search post');
            search=((req.body.search?req.body.search:null)?req.body.search.trim():null);
            const db=req.app.locals.db;
            date=new Date();
            now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            search=search.split(' ');
            search = sw.removeStopwords(search)

            products=[];
            for(i=0;i<search.length;i++)
            {
                await db.collection('products').find({name:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    products.push.apply(products,docs)
                })   
                await db.collection('products').find({description:{$regex: search[i],$options: 'i'},start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                    products.push.apply(products,docs)
                })   
                var subcategories=[];
                await db.collection('categories').find({name:{$regex: search[i],$options: 'i'}}).toArray().then((docs)=>{
                    subcategories=docs;        
                })   
                if(subcategories!=null)
                {
                    for(j=0;j<subcategories.length;j++)
                    {
                        await db.collection('products').find({categories:subcategories[j].name,start_date:{$lte:now},end_date:{$gte:now}}).toArray().then((docs)=>{
                            products.push.apply(products,docs);
                        })
                    }
                }
            }
            products=unique(products);
            
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
            console.log('/products shortname get');
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
                product=docs;
            
                
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
            console.log('/products shortname post');
            if(!req.cookies.loggedin)
                return res.redirect('/products/'+req.params.shortname+'?postnotloggedin');
            const db=req.app.locals.db;
            shortname=((req.params.shortname?req.params.shortname:null)?req.params.shortname.trim():null);
            amount=((req.body.amount?req.body.amount:null)?req.body.amount.trim():null);
            srating=((req.body.srating?req.body.srating:null)?req.body.srating.trim():null);
            brating=((req.body.brating?req.body.brating:null)?req.body.brating.trim():null);
            name=((req.body.name?req.body.name:null)?req.body.name.trim():null);
            buy_price=((req.body.buy_price?req.body.buy_price:null)?req.body.buy_price.trim():null);
            
            starting_bid=((req.body.starting_bid?req.body.starting_bid:null)?req.body.starting_bid.trim():null);
            location=((req.body.location?req.body.location:null)?req.body.location.trim():null);
            start_date=((req.body.start_date?req.body.start_date:null)?req.body.start_date.trim():null);
            end_date=((req.body.end_date?req.body.end_date:null)?req.body.end_date.trim():null);
            description=((req.body.description?req.body.description:null)?req.body.description.trim():null);
            _id=req.cookies._id;
            if(name!=null&&starting_bid!=null&&location!=null&&start_date!=null&&end_date!=null&&description!=null)
            {
                if(buy_price==null)
                    buy_price=0;
                console.log('edit auction');
                categories=[];
                if(Array.isArray(req.body.categories))
                {
                    //console.log('array');
                    for(var i=0;i<req.body.categories.length;i++)
                    {
                    if(req.body.categories[i]=='')
                        continue;
                    categories.push('allcats->'+req.body.categories[i]);
                    }
                }
                else 
                {
                    //console.log('not array');
                    categories.push('allcats->'+req.body.categories);
                }
                console.log(categories);
                var product;
                await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                    product=docs[0];
                })
                if(product.bids.length>0)
                {
                    console.log('edit auction error bidhasbeenmade');
                    return res.redirect('/products/'+shortname+'?change=false/reason=abidhasbeenmade');
                }
                date=new Date();
                now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                date=new Date(end_date);
                end_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                date=new Date(start_date);
                start_date=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                if(end_date<=start_date&&start_date>now) 
                {
                    console.log('edit auction error endsbeforestarts');
                    return res.redirect('/products'+shortname+'?success=false/reason=endsbeforestarts');
                }

                var re=/^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
                if(!re.test(String(name))){
                    console.log('edit auction error invalidname');
                    return res.redirect('/products'+shortname+'?success=false/reason=invalidname');
                }
                if(parseFloat(buy_price)<parseFloat(starting_bid)&&parseFloat(buy_price)>0)
                {
                    console.log('edit auction error buylessthanstarting');
                    return res.redirect('/products'+shortname+'?success=false/reason=buylessthanstarting');
                }
                photos=[];
                if(req.files.length>0)
                {
                    files=[];
                    await fs.readdir('./public/images/'+shortname, (err, fil) => {
                        if (err) throw err;
                        for (file of fil)
                            files.push(file);
                        
                    });
                    for (const file of files) {
                        await fs.unlink(path.join('./public/images/'+shortname, file), err => {
                        if (err) throw err;
                        });
                    }
                    for(var i=0;i<req.files.length;i++)
                    {
                        if((req.files[i].mimetype.endsWith("jpeg")) || (req.files[i].mimetype.endsWith("png")) || (req.files[i].mimetype.endsWith("jpg"))
                        || (req.files[i].mimetype.endsWith("gif")) )
                        {
                        await fs.rename(req.files[i].path,'./public/images/'+shortname+"/"+shortname+"_"+(i+1)+".jpg",function(){
                        })
                            photos[i]=shortname+'_'+(i+1).toString()+'.jpg';
                        }
                    }
                }
                
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
                await db.collection('products').updateOne({shortname:shortname},{$set:entry}).then((docs)=>{
                })
                console.log('edit auction successful');
                return res.redirect('/products/'+shortname);


            }
            
            else
            {
                console.log('rating');
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
                        await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{brate:true}})
                        var rating;
                        var newrate;
                        await db.collection('users').find({email:product.seller}).toArray().then((docs)=>{
                            rating=docs[0].rating;
                        })
                        newrate=rating.srating*rating.sratingnum;
                        rating.sratingnum++;
                        rating.srating=(newrate+parseInt(srating))/rating.sratingnum;
                        db.collection('users').updateOne({email:product.seller},{$set:{rating:rating}});
                        
                    }
                    if(brating!=null)
                    {
                        await db.collection('products').updateOne({shortname:req.params.shortname},{$set:{srate:true}})
                        var newrate;
                        var rating;
                        await db.collection('users').find({email:product.bids[product.bids.length-1].bidder}).toArray().then((docs)=>{
                            rating=docs[0].rating;
                        })
                        newrate=rating.brating*rating.bratingnum;
                        rating.bratingnum++;
                        rating.brating=(newrate+parseInt(brating))/rating.bratingnum;
                        db.collection('users').updateOne({email:product.bids[product.bids.length-1].bidder},{$set:{rating:rating}});
                        
                    }
                    console.log('rating successful');
                    res.redirect('/products/'+req.params.shortname);
                }
                else
                {
                    console.log('bid');
                    await db.collection('users').find({"_id":require('mongodb').ObjectID(_id.toString())}).toArray().then((docs)=>{
                        person=docs[0];
                    });
                    await db.collection('products').find({shortname:shortname}).toArray().then((docs)=>{
                        item=docs[0];
                    });
                    bids=item.bids;
                    if(bids.length==0&&parseFloat(amount)<item.starting_bid)
                    {
                        console.log('bid error bidnothigherthanfirst');
                        return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothigherthanfirst');
                    }
                    if(bids.length>0&&(bids[bids.length-1].amount>=parseFloat(amount)))
                    {
                        console.log('bid error bidnothighenough');
                        return res.redirect('/products/'+shortname+'?bidplace=false/reason=bidnothighenough');
                    }
                    date=new Date();
                    now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                    if(now<item.start_date||now>item.end_date)
                    {
                        console.log('bid error postbutauctionhasfinished');
                        return res.redirect('/products/'+shortname+'?postbutauctionhasended');
                    }
                    bid={};
                    bid['amount']=parseFloat(amount);
                    bid['bidder']=person.email;
                    date=new Date();
                    bid['time']=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                    bids.push(bid);
                    end=item.end_date;
                    if(parseFloat(amount)>=item.price&&item.price>0)
                    {
                        end=bid['time'];
                    }

                    await db.collection('products').updateOne({shortname:shortname},{$set: {bids:bids,end_date:end}}).then((docs)=>{
                    });      
                    console.log('bid successful');
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
            console.log('account accept user');
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').updateOne({email:req.params.who},{$set: {isaccepted:true}}).then((docs)=>{
                        console.log('account accepted success');
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
            console.log('account reject user');
            const db=req.app.locals.db;
            db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
                if(docs[0].type=='admin')
                {
                    db.collection('users').deleteOne({email:req.params.who}).then((docs)=>{
                        console.log('account rejected/deleted successfully');
                        return res.redirect('/account');                
                    });
                }     
            });       
        } 
        catch (err) {
            return next(err);
        }
        
    });
    const convert=require('xml-js');
    router.get("/database/files",async(req,res,next)=>{
        const db=req.app.locals.db;
        if(!req.cookies.loggedin)
            return res.redirect('/account');
        _id=req.cookies._id;
        db.collection('users').find({_id:require('mongodb').ObjectID(req.cookies._id.toString())}).toArray().then((docs)=>{
            if(docs[0].type!='admin')
            {
                return res.redirect('/account');
            }     
        });  
        var item;
        var products;
        await db.collection('products').find().toArray().then((docs)=>{
            products=docs;
        })
        modified=[];
        for(i=0;i<products.length;i++)
        {
            var item=products[i];
            entry={};
            entry['_attributes']={};
            entry['_attributes']['ItemID']=item._id.toString();
            entry['Category']=item.categories;
            entry['Currently']='$'+((item.bids.length>0?(item.bids[item.bids.length-1].amount):(item.starting_bid))).toString();
            entry['First_Bid']='$'+(item.starting_bid).toString();
            entry['Number_of_Bids']=(item.bids.length).toString();
            entry['Bids']=item.bids;
            entry['Location']=item.location;
            var person;
            await db.collection('users').find({email:item.seller}).toArray().then((bla)=>{
                person=bla[0];
            });
            entry['Country']=person.country;
            entry['Started']=item.start_date.toString();
            entry['Ends']=item.end_date.toString();
            entry['Seller']={};
            entry['Seller']['_attributes']={};
            entry['Seller']['_attributes']['Rating']=person.srating;
            entry['Seller']['_attributes']['UserID']=person._id.toString();
            entry['Description']=(item.description).toString();
            modified.push(entry);            
        }
        item=modified;
        var items={};
        items["Items"]={};
        items["Items"]["Item"]=item;
        var options={compact:true,spaces:2};
        var result=convert.json2xml(items,options);
        await fs.writeFile('./public/products.xml',result,(err)=>{
            console.log('db exported successfully to file');
        })
        return res.render("files",{
            page:"Files",
            loggedin:req.cookies.loggedin,
            });
    });
    router.get('/TOS',async(req,res,next)=>{
        return res.render("tos",{
            page:"Terms of Service",
            loggedin:req.cookies.loggedin,
            });
    })
    
    

    
    router.use("/login",loginroute(param));
    router.use("/account",myaccountroute(param));
    router.use('/createauction',createauction(param));
    router.use("/forgotpass",forgotpassroute(param));
    router.use("/resetpass",resetpassroute(param));
    return router;
};