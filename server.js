const fs = require('fs');
const path = require('path');
const express         = require("express");
const bodyParser      = require("body-parser");
const validator       = require("express-validator");
const mustacheExpress = require("mustache-express");
const morgan          = require("morgan");
const session         = require("express-session");
const routes          = require("./routes/index");

// Initialze Express App
const app = express();

// Set Port
app.set('port', (process.env.PORT || 8000));

// Serve static files to server
app.use(express.static(path.join(__dirname, "public")));

// Setting up View Engine
app.engine("mustache", mustacheExpress());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "mustache");


// Body parser and validator implementation
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

// Initialize Express Session
app.use(session({
  secret: 'thesecret',
  resave: false,
  saveUninitialized: false
}));

app.use(morgan('dev'));

// Import Routes
app.use(routes);

if(require.main === module){
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
}

module.exports = app;
