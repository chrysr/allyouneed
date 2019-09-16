const express = require("express");
const createerror = require("http-errors");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const configs = require("./config");
//const SpeakerService =require("./services/SpeakerService.js");
//const FeedbackService =require("./services/FeedbackService.js");
const ProductsService =require("./services/ProductService.js");
const routes = require("./routes");
const bcrypt=require('bcrypt');
const https = require('https');
const fs = require('fs');
const config=configs[app.get("env")];

//const speakerService = new SpeakerService(config.data.speakers);
//const feedbackService = new FeedbackService(config.data.feedback);
const productService = new ProductsService(config.data.products);
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


/*app.use(async(req,res,next)=>{
    try {
        const names = await speakerService.getnames();
        res.locals.speakernames = names;
        //console.log(names);
        return next();
    } catch(err) {
        return next(err);
    }
});*/
app.use(cookieParser());


app.use("/",routes({productService,}));

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
var multer = require('multer');
//var upload = multer({ dest: './uploads' });
app.use(multer({dest:'./uploads/'}).array('multiInputFileName'));

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017/allyouneed';
var args=process.argv;
var ssl=0;
for (var i=0;i<args.length;i++)
{
    if(args[i]=='-ssl')
        ssl=1;
}
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if(err) throw err;
    app.locals.db=client.db('allyouneed');
    app.locals.db.createCollection('users');
    app.locals.db.createCollection('categories');
    app.locals.db.createCollection('messages');
    app.locals.db.createCollection('products');
    app.locals.db.collection('users').find({email:"admin@allyouneed.com"}).toArray().then((docs)=>{
        if(docs.length==0)
        {
            var entry={email:"admin@allyouneed.com",password:bcrypt.hashSync("banhammer69420",bcrypt.genSaltSync(8),null),firstname:"admin",lastname:"admin",phone:"admin",address:"admin",taxpayerid:"admin",gender:"admin",type:"admin",isaccepted:true};
            app.locals.db.collection('users').insertOne(entry).then((docs)=>{
                console.log("Admin Created Successfully");
            })
        }
    })
    if(ssl)
    {
        console.log("Application Running at --> https://localhost:3000");
        https.createServer({
            key: fs.readFileSync('./server/config/key.pem'),
            cert: fs.readFileSync('./server/config/cert.pem'),
            passphrase: 'pass'
        },app).listen(3000);
    }
    else
    { 
        console.log("Application Running at --> http://localhost:3000");
        app.listen(3000);
    }

});





module.export=app;