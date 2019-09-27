const fs = require('fs');

function datafordb()
{
    data=fs.readFileSync('./server/config/db.csv').toString();
    arr=data.split('\n');
    newarr=[]
    for(i=0;i<arr.length;i++)
    {
        t=arr[i].split(',');
        for(j=0;j<t.length;j++)
            t[j]=t[j].replace(/"/g,'');
        newarr.push(t);
    }
    arr=[];
    for(i=0;i<newarr.length;i++)
    {
        tmp=[];
        var found=0;
        for(j=0;j<newarr[i].length;j++){
            if(newarr[i][j]!=''&&newarr[i][j]!='+'&&newarr[i][j]!='-')
            {
                tmp.push(newarr[i][j]); 
                break;
            }
            else tmp.push('');
            
        }
        arr.push(tmp);
    }
    ok=0;
    const sleep=require('sleep');
    class Stack { 
        constructor() 
        { 
            this.items = []; 
        } 
        push(element) 
        { 
            this.items.push(element); 
        } 
        pop() 
        { 
            if (this.items.length == 0) 
                return "Underflow"; 
            return this.items.pop(); 
        } 
        peek() 
        { 
            
            return this.items[this.items.length - 1]; 
        } 
        printStack() 
        { 
            var str = ""; 
            for (var i = 0; i < this.items.length; i++) 
                str += this.items[i] + " "; 
            return str; 
        } 
        isEmpty() 
        { 
            return this.items.length == 0; 
        } 
    } 
    var stack=new Stack();
    parent='allcats';
    allcats=[];
    cats={};
    cats[parent]=[];
    
    for(i=0;i<arr.length;i++)
    {
        if(arr[i]=='')
            continue;
        if(!ok)
        {
            if(arr[i].length==2)
                ok=1;
            else continue;
        }
        allcats.push(parent+"->"+arr[i][arr[i].length-1]);
        cats[parent].push(arr[i][arr[i].length-1]);
        if(arr[i+1].length>arr[i].length)
        {
            stack.push(parent);
            parent+="->"+arr[i][arr[i].length-1];
            cats[parent]=[];
        }
        else if(arr[i+1].length<arr[i].length||arr[i+1]=='')
        {
            j=arr[i].length-arr[i+1].length;
            while(j)
            {
                parent=stack.pop();
                j--;
            }
        }
       
    }
    allcatsmodified=[];
    for(i=0;i<allcats.length;i++)
        allcatsmodified.push({"name":allcats[i]});
    catsmodified=[];
    catsmodified.push({"name":"allcats",subcategories:cats["allcats"]});
    for(i=0;i<allcats.length;i++)
    {
        catsmodified.push({"name":allcats[i],"subcategories":cats[allcats[i]]});
    }
    return catsmodified;
}
async function createusersanditems(db){
    users=[];
    products=[];
    entry={};
    srating={
        srating:0,
        sratingnum:0,
        brating:0,
        bratingnum:0,
    };
    brating={
        brating:0,
        bratingnum:0,
    }
    
    var entry={rating:srating,email:'johndoe@gmail.com',password:bcrypt.hashSync('pass',bcrypt.genSaltSync(8),null),firstname:'John',lastname:'Doe',phone:'123456',address:'12345th Steet ',taxpayerid:'1234',gender:'Male',type:'Seller',country:'Greece',isaccepted:true,resetPasswordToken:''};
    await db.collection('users').find({email:'johndoe@gmail.com'}).toArray().then((docs)=>{
        if(docs.length==0)
            users.push(entry);
    })
    entry={rating:brating,email:'marysmith@gmail.com',password:bcrypt.hashSync('pass',bcrypt.genSaltSync(8),null),firstname:'Mary',lastname:'Smith',phone:'123456',address:'12345th Drive ',taxpayerid:'1234',gender:'Female',type:'Bidder',country:'Greece',isaccepted:true,resetPasswordToken:''};
    await db.collection('users').find({email:'marysmith@gmail.com'}).toArray().then((docs)=>{
        if(docs.length==0)
            users.push(entry);
    })
    entry={rating:brating,email:'adamjones@gmail.com',password:bcrypt.hashSync('pass',bcrypt.genSaltSync(8),null),firstname:'Adam',lastname:'Jones',phone:'123456',address:'12345th Avenue ',taxpayerid:'1234',gender:'Male',type:'Bidder',country:'Greece',isaccepted:true,resetPasswordToken:''};
    await db.collection('users').find({email:'adamjones@gmail.com'}).toArray().then((docs)=>{
        if(docs.length==0)
            users.push(entry);
    })
    if(users.length>0)
        db.collection('users').insertMany(users);
    for(i=0;i<users.length;i++)
    {
        if(i==0)
            console.log('Users Created:');
        console.log('-'+users[i].email+':pass');
    }
    if(users.length>0)
        console.log('\n');


    var entry;
    var categories=[];
    date=new Date();
    now=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    end=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    end.setDate(end.getDate()+Math.random()*6+1);
    categories.push('allcats->Clothing');
    categories.push('allcats->Sporting Goods');
    categories.push('allcats->Sporting Goods->Fitness');
    categories.push('allcats->Sporting Goods->Outdoor Sports');
    entry={shortname:'yeezy350',name:'Yeezy Boost 350',categories:categories,price:960.70,
    starting_bid:10.0,bids:[],location:'Athens',country:'',
    seller:'johndoe@gmail.com',description:"Adidas primeknit microfiber and TPU sole sneakers . The most popular colorway of the most preferred silhouette from Kanye West's collection.",
    start_date:now,end_date:end,photo:["yeezy350_1.jpg","yeezy350_2.jpg"]}
    await db.collection('products').find({shortname:'yeezy350'}).toArray().then((docs)=>{
        if(docs.length==0)
            products.push(entry);
    })
    categories=[];
    end=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    end.setDate(end.getDate()+Math.random()*6+1);    categories.push('allcats->Clothing');
    categories.push('allcats->Clothing->Men');
    categories.push("allcats->Clothing->Men->Men's Accessories");
    categories.push("allcats->Clothing->Men->Men's Accessories->Sunglasses & Sunglasses Accessories");
    entry={shortname:'flight006',name:'Dita Flight 006',categories:categories,price:475.00,
    starting_bid:20.0,bids:[],location:'Athens',country:'',
    seller:'johndoe@gmail.com',description:"Titanium Frame UVA UVB polarized aviator sunglasses. Classic fighter pilot swagger - modern and muscular materials.",
    start_date:now,end_date:end,photo:["flight006_1.jpg","flight006_2.jpg","flight006_3.jpg"]}
    await db.collection('products').find({shortname:'flight006'}).toArray().then((docs)=>{
        if(docs.length==0)
            products.push(entry);
    })
    categories=[];
    end=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    end.setDate(end.getDate()+Math.random()*6+1);    categories.push('allcats->Jewelery & Watches->Watches');
    categories.push('allcats->Jewelery & Watches');
    categories.push('allcats->Consumer Electronics');
    entry={shortname:'apple-watch',name:"Apple Watch",categories:categories,price:349.99,
    starting_bid:20.0,bids:[],location:'Thessaloniki',country:'',
    seller:'johndoe@gmail.com',description:"Space Black Stainless Steel Case with Space Black Milanese Loop. Fundamentally redesigned and re-engineered to help you be even more active, healthy and connected. Some more text goes here for tests",
    start_date:now,end_date:end,photo:["apple-watch_1.jpg","apple-watch_2.jpg","apple-watch_3.jpg"]}
    await db.collection('products').find({shortname:'apple-watch'}).toArray().then((docs)=>{
        if(docs.length==0)
            products.push(entry);
    })
    categories=[];
    end=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    end.setDate(end.getDate()+Math.random()*6+1);    categories.push('allcats->Clothing');
    categories.push('allcats->Clothing->Men');
    categories.push("allcats->Clothing->Men->Men's Clothing");
    categories.push("allcats->Clothing->Men->Men's Clothing->Coats & Jackets");
    entry={shortname:'nasa-bomber',name:'NASA Bomber Jacket',categories:categories,price:57.30,
    starting_bid:5.0,bids:[],location:'Patras',country:'',
    seller:'johndoe@gmail.com',description:"Embroided acetate-polyester zip-up bomber. Honor the anniversary of the moon landing with this classic yet modern Asstseries limited jacket.",
    start_date:now,end_date:end,photo:["nasa-bomber_1.jpg","nasa-bomber_2.jpg"]}
    await db.collection('products').find({shortname:'nasa-bomber'}).toArray().then((docs)=>{
        if(docs.length==0)
            products.push(entry);
    })

    if(products.length>0)
        db.collection('products').insertMany(products);
    for(i=0;i<products.length;i++)
    {
        if(i==0)
            console.log("Products Inserted");
        console.log('-'+products[i].name);
    }
}
const express = require("express");
const createerror = require("http-errors");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const configs = require("./config");
const routes = require("./routes");
const bcrypt=require('bcrypt');
const https = require('https');
const config=configs[app.get("env")];
const cookieParser = require('cookie-parser');

app.set("view engine","pug");
if (app.get("env")==="development"){
    app.locals.pretty=true;
}
app.set("views",path.join(__dirname,"./views"));
app.locals.title = config.sitename

app.use((req,res,next) => {
    res.locals.rendertime = new Date();
    return next();
});

app.use(express.static("public"));

app.use(bodyparser.urlencoded({extended:true}));

app.get("/favicon.ico",(req,res,next)=>{
    return res.sendStatus(204);
});



app.use(cookieParser());


app.use("/",routes());

app.use((req,res,next)=>{
    return next(createerror(404,"File not found"));
});

app.use((err,req,res,next)=>{
    res.locals.message=err.message;
    const status  = err.status || 500;
    res.locals.status=status;
    res.locals.error=     req.app.get("env") === "development" ? err : {} ;
    res.status(status);
    return res.render("error");
});


const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017/allyouneed';
var args=process.argv;
var ssl=0;
var fill=0;
for (var i=0;i<args.length;i++)
{
    if(args[i]=='-ssl')
        ssl=1;
    if(args[i]=='-fill')
        fill=1;
}
const ip = require("ip");
fs.mkdir('uploads',(err)=>{
});

MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true}, (err, client) => {
    if(err) throw err;
    app.locals.db=client.db('allyouneed');
    app.locals.db.createCollection('users');
    app.locals.db.createCollection('categories');
    app.locals.db.collection('categories').find().toArray().then((docs)=>{
        if(docs.length==0)
        {
            app.locals.db.collection('categories').insertMany(datafordb());
            console.log("Inserted Categories to db");
        }
        
    })
    app.locals.db.createCollection('messages');
    app.locals.db.createCollection('products');
    app.locals.db.collection('users').find({email:"admin@allyouneed.com"}).toArray().then((docs)=>{
        if(docs.length==0)
        {
            var entry={email:"admin@allyouneed.com",password:bcrypt.hashSync("admin",bcrypt.genSaltSync(8),null),firstname:"admin",lastname:"admin",phone:0,address:"admin",taxpayerid:0,gender:"admin",type:"admin",country:'Greece',isaccepted:true,resetPasswordToken:''};

            app.locals.db.collection('users').insertOne(entry).then((docs)=>{
                console.log("Admin Account Created! email:admin@allyouneed.com | pass:admin");
            })
        }
    })
    if(fill)
    {
        const db=app.locals.db;
        createusersanditems(db);
        
    }
    app.locals.ip=ip.address();

    if(ssl)
    {  
        app.locals.ssl=1;
        console.log("Application Running at --> https://localhost:3000\n");
        https.createServer({
            key: fs.readFileSync('./server/config/key.pem'),
            cert: fs.readFileSync('./server/config/cert.pem'),
            passphrase: 'pass'
        },app).listen(3000);
    }
    else
    { 
        app.locals.ssl=0;
        console.log("Application Running at --> http://localhost:3000\n");
        app.listen(3000);
    }

});





module.export=app;