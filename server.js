var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 8080;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localHost/scraper", {
  useMongoClient: true
});

app.get("/scrape", function(req, res) {
    
    request("https://www.nytimes.com/", function(error, response, html) {
    
    var $ = cheerio.load(html);
    
    $("h2.story-heading").each(function(i, element) {
        
        var result = {};
        
        result.title = $(element).text();
        result.link = $(element).children().attr("href");
        
        console.log( result.title + result.link);
        
        db.Article
        .create(result)
        .then(function(adArticle) {
            
            res.send("Scrape Complete");
        })
        .catch(function(err) {
            res.json(err);
        });
        
    });
    
});
});



app.get("/articles", function(req, res) {

  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });

});


app.get("/articles/:id", function(req, res) {
    
    db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
    
    db.Note
    .create(req.body)
    .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id}, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});





app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});