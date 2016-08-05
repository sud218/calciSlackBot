// server.js
//
// // BASE SETUP
// // =============================================================================
//
// // call the packages we need
var express = require("express");
var bodyParser = require('body-parser');

// load math.js 
var math = require('mathjs');

var app = express();

// configure app to use bodyParser()
// // this will let us get the data from a POST
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + "/public"));

// ROUTES FOR OUR API
// // =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// slack calculator api
router.post("/calc", function(req, res) {

    // api auth
    var headers = request.headers;
    var apiKey = headers['x-igloo-apikey'];
    if (apiKey != process.env.APIKEY) {
        var expression = req.body.expression;
        try {
            var value = math.round(math.eval(expression), 3); 
            res.status(200).json({"status":1, "message":"expression `" + expression + "`  calculated successfully", "value" : value});
        } catch (err) {
            res.status(500).json({"status":0, "message":"expression `" + expression + "`  seems to be broken. Please have a look and try again!", "value" : "NAN"});
        }
    } else {
        res.status(400).json({"status":0, "message":"Authentication failed", "value" : "NAN"});
    }
});

// REGISTER OUR ROUTES -------------------------------
// // all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// // =============================================================================
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
