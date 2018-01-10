var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;
var MONGODB_URI = process.env.MONGODB_URI ||"mongodb://localHost/scraper"

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI)
mongoose.connect("mongodb://localHost/scraper");

app.get("/scrape", function(req, res) {
    
    request("https://www.nytimes.com/", function(error, response, html) {
    
    var $ = cheerio.load(html);
    
    $("article.theme-summary").each(function(i, element) {
        if (i < 10 ) {
        var result = {};
        
        result.title = $(element).children("h2").text();
        result.link = $(element).children().children().attr("href");
        result.summary = $(element).children("p.summary").text();
        
        console.log(result.title + result.link);
        console.log("Summary - " + result.summary);
        
        //console.log( result.title + result.link);
        if (!result.link) {
            //console.log("Link not found.");
            //console.log(result.title);
        }
        
        db.Article
        .create(result)
        .then(function(adArticle) {
            //console.log(adArticle);
            
        })
        .catch(function(err) {
            //console.log(err);
        });
        }
    });
   res.send("Scrape Complete"); 
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