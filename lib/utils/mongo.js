var mongoose = require("mongoose");
var db = mongoose.connection;

mongoose.connect( process.env.MONGOHQ_URL || 'mongodb://localhost/fantasy' );

// Error handler
db.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
db.on('disconnected', function () {
  connect();
});

// connected!
db.once('open', function callback () {
  console.log("Connected to Mongo!");
});