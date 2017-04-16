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
        var speechObj = OutputText.match(/[^\.!\?]+[\.!\?]+/g),
            speech = new Speech();  

        // TODO fix ' with \' but only if it needs to be as some text already has the escape char

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
        var url          = alfred_BaseURL + '?' + api_app_key,
            intent_obj   = this,
            errorMessage = 'There has been an error. I am unable to say hello.';

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body.data;
            if (apiObj.body.code == 'sucess') {
                intent_obj.emit(':tell', processResponseText(apiData)); // Send response back to alexa
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('hello: ' + err);
        });
    },
    'HelpIntent': function() {
        this.emit('AMAZON.HelpIntent');
    },
    'AMAZON.HelpIntent': function () {
        var url          = alfred_BaseURL + '/help?' + api_app_key,
            intent_obj   = this,
            errorMessage = 'There has been an error. I am unable to help you.';

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body.data;
            if (apiObj.body.code == 'sucess'){
                intent_obj.emit(':tell', processResponseText(apiData)); // Send response back to alexa
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('help: ' + err);
        });
    },

    // Joke api mappings
    'JokeIntent': function() {
        var url          = alfred_BaseURL + '/joke?' + api_app_key,
            intent_obj   = this,
            errorMessage = 'There has been an error. I am unable to tell you a Joke.';

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body.data;
            if (apiObj.body.code == 'sucess'){
                intent_obj.emit(':tell', processResponseText(apiData)); // Send response back to alexa
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', 'There was an error with the joke request.'); // Send response back to alexa
            console.log('joke: ' + err);
        });
    },

    // Light api mappings - TODO
    'LightsIntent': function() {
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // News api mappings
    'NewsIntent': function() {
        var itemSlot     = this.event.request.intent.slots.newstype,
            slotValue    = 'news',
            intent_obj   = this,
            errorMessage = 'There has been an error. I am unable to tell you the news.';
 
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

        var url = alfred_BaseURL + '/news?news_type=' + slotValue + '&' + api_app_key;

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData         = apiObj.body, // Get the news data
                outputHeadlines = 'Here are the headlines: ';

            if (apiObj.body.code == 'sucess') {
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
                intent_obj.emit(':tell', outputHeadlines); // Send response back to alexa
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err){
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('news: ' + err);
        });
    },

    // Search api mappings - TODO
    'SearchIntent': function() {
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // Time api mappings
    'TimeIntent': function() {
        var url          = alfred_BaseURL + '/whatisthetime?' + api_app_key,
            intent_obj   = this,
            errorMessage = 'There has been an error. I am unable to tell you the time.';

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body.data;
            if (apiObj.body.code == 'sucess') {
                intent_obj.emit(':tell', processResponseText(apiData)); // Send response back to alexa
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('time: ' + err);
        });
    },

    // Travel api mappings - TODO
    'TravelIntent': function (){
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // TV api mappings - TODO
    'TVIntent': function (){
        var intent_obj = this;
            intent_obj.emit(':tell', 'To Do');
    },

    // Weather api mappings
    'WillItSnowIntent': function (){
        var itemSlot             = this.event.request.intent.slots.location,
            slotValue            = '',
            intent_obj           = this,
            errorMessage         = 'There has been an error. I am unable to tell you if it will snow.',
            willItSnowMessage    = '',
            willItSnowMessageEnd = '.';

        if (itemSlot && itemSlot.value) {
            slotValue = itemSlot.value.toLowerCase();
            willItSnowMessageEnd = ' in ' + slotValue + '.';
        };

        var url = alfred_BaseURL + '/weather/willitsnow?location=' + slotValue + '&' + api_app_key;

        requestAPIdata(url)
        .then(function(apiObj) {
            var apiData = apiObj.body.data;
            if (apiObj.body.code == 'sucess'){
                if (apiObj.body.data.going_to_snow){
                    willItSnowMessage = 'It\'s going to Snow';
                } else {
                    willItSnowMessage = 'It\'s not going to snow in the new few days';
                };
                willItSnowMessage = willItSnowMessage + willItSnowMessageEnd;
                intent_obj.emit(':tell', willItSnowMessage); // Send response back to alexa
            }else{
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('time: ' + err);
        });
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