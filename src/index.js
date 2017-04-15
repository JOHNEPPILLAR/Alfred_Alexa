'use strict';
const Alexa  = require('alexa-sdk'),
      rp     = require('request-promise'),
      dotenv = require('dotenv'),
      Speech = require('ssml-builder');

// Load env vars
dotenv.load()
// TODO - fix as env does not work when using nodenmon from root!

var APP_ID         = undefined, //process.env.appid,
    api_app_key    = 'app_key=' + '631dd7b4-62bf-4dbe-93be-7eef30922bc4',
    alfred_BaseURL = 'http://localhost:3978';
    //alfred_BaseURL = 'http://' + process.env.Alfred_DI_IP + ':' + process.env.Alfred_DI_Port 

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
    };
    return rp(options);
};

// Process the returning text 
function processResponseText(OutputText) {
    if (OutputText!== null) {
        var speechObj =OutputText.match(/[^\.!\?]+[\.!\?]+/g),
            speech = new Speech();  
        speechObj.forEach(function(value) { // Construct ssml response
            speech.say(value);
            speech.pause('500ms');
        });
        return speech.ssml(true);
    } else {
        return 'There was an error processing the response text.';
    };
};

//=========================================================
// Alexa skill
//=========================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//=========================================================
// Intents
//=========================================================
var handlers = {
    // Generic api mappings
    'LaunchRequest': function() {
        this.emit('HelloIntent');
    },
    'HelloIntent': function() {
        var url = alfred_BaseURL + '?' + api_app_key,
            intent_obj = this;
        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body; // Get the hello data
            intent_obj.emit(':tell', processResponseText(apiData.data)); // Send response back to alexa
        })
        .catch(function(err) {
            intent_obj.emit(':tell', 'There was an error with the hello request.'); // Send response back to alexa
            console.log('hello: ' + err);
        });
    },
    'HelpIntent': function() {
        this.emit('AMAZON.HelpIntent');
    },
    'AMAZON.HelpIntent': function () {
        var url = alfred_BaseURL + '/help?' + api_app_key,
            intent_obj = this;
        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body; // Get the help data
            intent_obj.emit(':tell', processResponseText(apiData.data)); // Send response back to alexa
        })
        .catch(function(err) {
            intent_obj.emit(':tell', 'There was an error with the help request.'); // Send response back to alexa
            console.log('help: ' + err);
        });
    },

    // Joke api mappings
    'JokeIntent': function() {
        var url = alfred_BaseURL + '/joke?' + api_app_key,
            intent_obj = this;
        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body; // Get the joke data
            intent_obj.emit(':tell', processResponseText(apiData.data)); // Send response back to alexa
        })
        .catch(function(err) {
            intent_obj.emit(':tell', 'There was an error with the joke request.'); // Send response back to alexa
            console.log('joke: ' + err);
        });
    },

    // Light api mappings
    'LightsIntent': function() {
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // News api mappings
    'NewsIntent': function() {
        var itemSlot      = this.event.request.intent.slots.newstype,
            slotValue     = 'news',
            newsErrorText = 'There was an error getting the news.';
 
        if (itemSlot && itemSlot.value) {
            slotValue = itemSlot.value.toLowerCase();
        };

        switch (slotValue) {
        case 'news':
            break;
        case 'sports':
            break;
        case 'science':
            break;
        case 'tech':
            break;
        case 'business':
            break;
        default:
            slotValue = 'news';
            break;
        };

        var url = alfred_BaseURL + '/news?news_type=' + slotValue + '&' + api_app_key,
            intent_obj = this;

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData         = apiObj.body, // Get the news data
                outputHeadlines = 'Here are the headlines: ';

            if (apiData.code == 'error') {
                outputHeadlines = newsErrorText;
            } else {
                switch (slotValue) {
                case 'news':
                    apiData.data.forEach(function(value) {
                        outputHeadlines = outputHeadlines + value.title + '. ';
                    });
                    outputHeadlines = processResponseText(outputHeadlines);
                    break;
                case 'sports':
                    apiData.data.forEach(function(value) {
                        outputHeadlines = outputHeadlines + value.title + '. ';
                    });
                    outputHeadlines = processResponseText(outputHeadlines);
                    break;
                case 'science':
                    apiData.data.forEach(function(value) {
                        outputHeadlines = outputHeadlines + value.title + '. ';
                    });
                    outputHeadlines = processResponseText(outputHeadlines);
                    break;
                case 'tech':
                    apiData.data.forEach(function(value) {
                        outputHeadlines = outputHeadlines + value.title + '. ';
                    });
                    outputHeadlines = processResponseText(outputHeadlines);
                    break;
                case 'business':
                    apiData.data.forEach(function(value) {
                        outputHeadlines = outputHeadlines + value.title + '. ';
                    });
                    outputHeadlines = processResponseText(outputHeadlines);
                    break;
                };
            };
            intent_obj.emit(':tell', outputHeadlines); // Send response back to alexa
        })
        .catch(function(err){
            intent_obj.emit(':tell', newsErrorText); // Send response back to alexa
            console.log('news: ' + err);
        });
    },

    // Search api mappings
    'SearchIntent': function() {
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // Time api mappings
    'TimeIntent': function() {
        var url = alfred_BaseURL + '/whatisthetime?' + api_app_key,
            intent_obj = this;
        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body; // Get the time data
            intent_obj.emit(':tell', processResponseText(apiData.data)); // Send response back to alexa
        })
        .catch(function(err) {
            intent_obj.emit(':tell', 'There was an error with the time request.'); // Send response back to alexa
            console.log('time: ' + err);
        });
    },

    // Travel api mappings
    'TravelIntent': function (){
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    'TVIntent': function (){
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },
    'WeatherIntent': function (){
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },




    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Cancelled, goodBye.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Stopped, goodbye.");
    },
      'Unhandled': function () {
        this.emit(':ask', 'to do. unhandeled Message', 'to do. unhandeled Message');
    }
};