const express = require("express");
const createerror = require("http-errors");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const configs = require("./config");
const SpeakerService =require("./services/SpeakerService.js");
const FeedbackService =require("./services/FeedbackService.js");
const ProductsService =require("./services/ProductService.js");
const routes = require("./routes");

const config=configs[app.get("env")];

const speakerService = new SpeakerService(config.data.speakers);
const feedbackService = new FeedbackService(config.data.feedback);
const productService = new ProductsService(config.data.products);

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


app.use("/",routes({speakerService,feedbackService,productService,}));

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

app.listen(3000);

module.export=app;