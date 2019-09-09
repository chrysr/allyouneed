const path = require("path");

module.exports = {
    development : {
        sitename : "Roux meetups [development mode]",
        data : {
            speakers : path.join(__dirname,"../data/speakers.json"),
            feedback : path.join(__dirname,"../data/feedback.json")
        }
    },
    production : {
        sitename : "Roux meetups [user mode]",
        data : {
            speakers : path.join(__dirname,"../data/speakers.json"),
            feedback : path.join(__dirname,"../data/feedback.json")
        }
    }
}