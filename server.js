// server.js
//
// // BASE SETUP
// // =============================================================================
//
// // call the packages we need
var express = require("express");
var bodyParser = require('body-parser');
var RtmClient = require('@slack/client').RtmClient;
var math = require('mathjs');
var request = require('request');

var app = express();

// configure app to use bodyParser()
// // this will let us get the data from a POST
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + "/public"));


// SLACK CONNECTIONS
var slackToken = process.env.SLACK_APIKEY || '';
var slackVerificationCode = process.env.SLACK_VERIFICATION_TOKEN || '';

//var rtm = new RtmClient(token, {logLevel: 'debug'});
//rtm.start();

// ROUTES FOR OUR API
// // =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// slack calculator api
// slack Authentication
router.get("/calc/slack", function(req, res) {
    
    var code = req.query.code;
    // call auth to get the token from slack
    request({
        url: "https://slack.com/api/oauth.access",
        qs: {
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_APIKEY,
            code: code
        },
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: ""
    }, function(error, response, body) {
        if(error) {
            res.status(400).json("Authentication failed with Slack!");
        } else {
            res.status(200).json(response);
        }
    });
});

router.post("/calc/slack", function(req, res) {

    // api auth
    console.log(req);
    if (slackToken == req.body.token) {
        var expression = req.body.text;

        // check if the body is `help`
        if (expression == 'help' || expression == '') {
			res.status(200).json({"username": "calcbot",
    						"mrkdwn": true,
							"attachments": [
        						{
            						"pretext": "*Hi!* Need to do a calculation while doing your work on Slack? Now, no need to leave slack at all!",
									"author_name": "Sudhanshu Shekhar",
            						"author_link": "https://www.linkedin.com/in/sudhanshushekhar1",
            						"author_icon": "https://avatars0.githubusercontent.com/u/7766076?v=3&u=ecc19fccc2e6f1039d7e597b01064c43052fd2bb&s=140",
            						"title": "try `/calc (2.25 + 76.0) * 18` or simply `/calc 2 + 2`",
            						"text": "Supports all normal and scientific expressions! In Slack Calculator Documentation <https://slack-calc.herokuapp.com>",
            						"color": "green"
        						}
    						]});
        } else {
             try {
                 var value = math.round(math.eval(expression), 3); 
				 res.status(200).json({"username": "calcbot",
    						"mrkdwn": true,
							"attachments": [
        						{
            						"pretext": expression,
            						"title": value,
            						"color": "green"
        						}
    						]});
             } catch (err) {
				 res.status(200).json({"username": "calcbot",
    						"mrkdwn": true,
							"attachments": [
        						{
            						"pretext": "`" + expression + "` seems to be broken! Would you mind having a second look and try again?",
            						"title": "NAN",
            						"color": "warning"
        						}
    						]});
             }
        }
    } else {
				 res.status(200).json({"username": "calcbot",
    						"mrkdwn": true,
							"attachments": [
        						{
            						"pretext": "Authentication failed",
            						"title": "NAN",
            						"color": "danger"
        						}
    						]});
    }
});


// general test calc 
router.post("/calc", function(req, res) {

    // api auth
    var headers = req.headers;
    var apiKey = headers['x-igloo-apikey'];
    if (apiKey == process.env.APIKEY) {
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
