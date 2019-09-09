const path = require("path");

module.exports = {
    development : {
        sitename : "All You Need [DM]",
        data : {
            speakers : path.join(__dirname,"../data/speakers.json"),
            feedback : path.join(__dirname,"../data/feedback.json"),
            products : path.join(__dirname,"../data/products.json")
        }
    },
    production : {
        sitename : "All You Need",
        data : {
            speakers : path.join(__dirname,"../data/speakers.json"),
            feedback : path.join(__dirname,"../data/feedback.json"),
            products : path.join(__dirname,"../data/products.json")
        }
    }
}