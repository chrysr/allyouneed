const express = require("express");
const createerror = require("http-errors");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const configs = require("./config");
const SpeakerService =require("./services/SpeakerService.js");
const FeedbackService =require("./services/FeedbackService.js");
const LoginService=require("./services/LoginService.js");
const routes = require("./routes");
const app=express();
/*NEW
const webpackConfig=require('../webpack.config');
const isDev=process.env.NODE_ENV!=='production';
const confign=require('./config/config');
const fs=require('fs');
const mongoose=require('mongoose');
const webpack=require('webpack');
const historyApiFallback=require('connect-history-api-fallback');
const webpackDevMiddleware=require('webpack-dev-middleware');
const webpackHotMiddleware=require('webpack-hot-middleware');

mongoose.connect(isDev?confign.db_dev : confign.db);
mongoose.Promise=global.Promise;
app.use(express.urlencoded({extended:true}));
app.use(express.json());
require('./routes')(app);
if (isDev) {
const compiler = webpack(webpackConfig);

app.use(historyApiFallback({
    verbose: false
}));

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(__dirname, '../client/public'),
    stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
    }
}));

app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
app.use(express.static(path.resolve(__dirname, '../dist')));
app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    res.end();
});
}
END NEW*/
/*NEW NEW*/
/*const MongoClient = require('mongodb').MongoClient;

const client=MongoClient.connect("mongodb://localhost:27017/login", { useNewUrlParser: true,useUnifiedTopology: true },function (err, db) {
   
     if(err) throw err;
});*/


/*END NEW NEW*/

const config=configs[app.get("env")];

const speakerService = new SpeakerService(config.data.speakers);
const feedbackService = new FeedbackService(config.data.feedback);
const loginService=new LoginService(config.data.login);

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


app.use(async(req,res,next)=>{
    try {
        const names = await speakerService.getnames();
        res.locals.speakernames = names;
        //console.log(names);
        return next();
    } catch(err) {
        return next(err);
    }
});


app.use("/",routes({speakerService,feedbackService,loginService}));

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
console.log(process.cwd());

app.listen(3000);

module.export=app;