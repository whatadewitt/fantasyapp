
/**
 * Module dependencies.
 */
// require("newrelic");

var express = require("express");
var routes = require("./routes");
var http = require("http");
var path = require("path");
var db = require("./lib/utils/mongo");
var fantasy = require("./lib/utils/fantasy");

var app = express();

app.configure(function(){
  app.set("port", process.env.PORT || 3000);
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

app.configure("development", function(){
  app.use(express.errorHandler());
});

app.get("/", routes.index);
app.get("/pluckdraft", fantasy.getDraftResults);
app.get("/getleagueteams", fantasy.getLeagueTeams);

http.createServer(app).listen(app.get("port"), function(){
  console.log("Express server listening on port " + app.get("port"));
});
