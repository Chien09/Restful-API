/*
Creating Wiki Restful API project, which will be utilizing software POSTMAN to test HTTP requests to this Restful API 

-Install npm --> npm init
-Install express --> npm i express
-Install body-parser --> npm i body-parser
-Install EJS --> npm i ejs 
-Install mongoose --> npm i mongoose 

When creating a Restful API it is important to follow "Specific Patterns of Routes/Endpoint URLs" 
requirements read more in --> Restful API.docx

**New addition "Chained Route Handlers using Express"**
using "app.route()" to chain the different type of CRUB requests like so
"app.route().get().post().delete()", so you won't have to repeatedly write the path code

EXAMPLE: 
app.route('/book')
  .get(function (req, res) {
    res.send('Get a random book')
  })
  .post(function (req, res) {
    res.send('Add a book')
  })
  .put(function (req, res) {
    res.send('Update the book')
  })

References go the "app.route()" section --> https://expressjs.com/en/guide/routing.html
*/

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

const mongoose = require('mongoose');

//connect to local MongoDB server, and create DB or look for it and link to the 'wikiDB' 
mongoose.connect('mongodb://localhost:27017/wikiDB'); 

//create schema
const articleSchema = new mongoose.Schema({ 
    title: String,
    content: String
  }); 

//creating a new collection and follow the articleSchema requirment 
const Article = mongoose.model("Article", articleSchema); 

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//////////////////////////////////Request Targeting All Articles///////////////////////////////////////

//using Route() chaining handler to incompass all GET,POST,DELETE requests so do not have to keep 
//typing the path "/articles" 
//check commented out code below to see a different version of coding
app.route("/articles")
    //search for all articles 
    .get(function(request, response){
        Article.find({}, function(err, articles){
            if(!err){
                response.send(articles); 
            } else{
                response.send(err);
            }
        });
    })

    //add or create a new Article 
    .post(function(request, response){
        const newArticle = new Article({
            title: request.body.title,
            content: request.body.content
        });

        newArticle.save(function(err){
            if(!err){
                response.send("Successfully added a new article to DB!"); 
            } else{
                response.send(err); 
            }
        });
    })

    //delete all articles in DB
    .delete(function(request, response){
        Article.deleteMany(function(err){
            if(!err){
                response.send("Successfully deleted all articles data in wikiDB!");
            } else{
                response.send(err); 
            }
        });
    });

/*
//Same code as above but without Chained Handler Route() 

//GET --> to fetch all articles from DB
app.get("/articles", function(request, response){
    Article.find({}, function(err, articles){
        if(!err){
            response.send(articles); 
        } else{
            response.send(err);
        }
    });
});

//POST --> add/create data to DB 
//USE Software POSTMAN to create a new HTTP request to simulate a POST request. 
//So add a POST link as "localhost:3000/articles".
//Then in the "Body" tab next to the "Headers" tab, select "x-www-form-urlencoded"
//Include the KEYs title & content and then type the 
//value or data you want to POST to the server. 
//Once this server is up and running, use POSTMAN and press "Send"
//You will be able to see the log that the data from POSTMAN is recieved 
app.post("/articles", function(request, response){
    //console.log(request.body.title);
    //console.log(request.body.content); 

    const newArticle = new Article({
        title: request.body.title,
        content: request.body.content
    });

    //save the data
    newArticle.save(function(err){
        if(!err){
            response.send("Successfully added a new article to DB!"); 
        } else{
            response.send(err); 
        }
    });

});

//DELETE --> remove data(s) from DB 
//Again use POSTMAN and create a new HTTP request 
//So Delete link as "localhost:3000/articles"
//Then press send all the articles in DB will be deleted 
app.delete("/articles", function(request, response){
    Article.deleteMany(function(err){
        if(!err){
            response.send("Successfully deleted all articles data in wikiDB!");
        } else{
            response.send(err); 
        }
    });
});

*/


//////////////////////////////////Request Targeting A Specific Article///////////////////////////////////////

//Using Route Params 
//Use POSTMAN to test this request, but select "Params" tab instead of "Body"
//Make sure it is an article title that is present in DB --> Example "localhost:3000/articles/DOM"
//NOTE: if the article title has a space use "%20" --> Example "localhost:3000/articles/Jack%20Liu"
//Reference of Html URL Encoding --> https://www.w3schools.com/tags/ref_urlencode.ASP
app.route("/articles/:articleTitle")
    //search for an article 
    .get(function(request, response){
        Article.findOne({title: request.params.articleTitle}, function(err, article){
            if(article){ //boolean 
                response.send(article);
            } else{
                response.send("No articles matching that title was found!"); 
            }
        });
    })

    //PUT will Update all of an article's properties title and content in DB
    //create a new HTTP reuqest in POSTMAN (for testing) then select PUT and in the "body" tab select "x-www-form-urlencoded"
    //input whatever title & content to update 
    .put(function(request, response){
        Article.updateOne(
            {title: request.params.articleTitle}, 
            {title: request.body.title, content: request.body.content}, //title, content name will need to match the POSTMAN body keys
            function(err){
                if(!err){
                    response.send("Successfully updated the article!"); 
                } else {
                    response.send(err); 
                }
            }
        );
    })

    //PATCH will update only specified properties of an article in DB
    //create a new HTTP reuqest in POSTMAN (for testing) then select PATCH and in the "body" tab select "x-www-form-urlencoded"
    .patch(function(request, response){
        Article.updateOne(
            {title: request.params.articleTitle},
            {$set: request.body}, //will update the article based on passed in key(s) and value(s) from HTTP request
            function(err){
                if(!err){
                    response.send("Successfully updated the article!");
                } else{
                    response.send(err); 
                }
            }
        );
    })

    //DELETE a specific article 
    //create a new HTTP request in POSTMAN as DELETE 
    .delete(function(request, response){
        Article.deleteOne(
            {title: request.params.articleTitle},
            function(err){
                if(!err){
                    response.send("Successfully deleted the article!");
                } else{
                    response.send(err); 
                }
            }
        );
    });
