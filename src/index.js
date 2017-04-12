'use strict';
const Alexa  = require('alexa-sdk'),
      rp     = require('request-promise'),
      dotenv = require('dotenv'),
      Speech = require('ssml-builder');

// Load env vars
dotenv.load()

var APP_ID = process.env.appid;

//=========================================================
// Helper functions
//=========================================================

// Call a remote API to get data
function requestAPIdata (apiURL, userAgent) {
    var options = {
        'User-Agent': userAgent,
        method: 'GET',
        uri: apiURL,
        resolveWithFullResponse: true,
        json: true
    }
    return rp(options);
};

// Alexa skill
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    //alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// Intents
var handlers = {
//    'LaunchRequest': function () {
//        this.emit('HelloIntent');
//    },
    'HelloIntent': function () {
        this.emit(':tell', "hello there.");
    },


    'NewsIntent': function () {
        var url = 'http://localhost:3978/joke';
        requestAPIdata(url)
        .then(function(apiData){
            // Get the joke data
            apiData = apiData.body;
            // Send response back to alexa
            this.emit(':tell', apiData.data);
            //sendResponse(apiData.joke);
        })
        .catch(function(err){
            // Send response back to caller
            //alfredHelper.sendResponse(res, 'error', err.message);
            //logger.error('joke: ' + err);
        });
    },




    'AMAZON.HelpIntent': function () {
        this.emit(':tell', "hello there, you asked for help.");
//        var speechOutput = "";
//        var reprompt = "";
//        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Cancelled, goodBye.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Stopped, goodbye.");
    }
};