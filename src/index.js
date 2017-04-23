'use strict';

const Alexa      = require('alexa-sdk'),
      rp         = require('request-promise'),
      dotenv     = require('dotenv'),
      logger     = require('winston'),
      dateFormat = require('dateformat'),
      Speech     = require('ssml-builder');

dotenv.load() // Load env vars

var baseUrl     = 'http://' + process.env.Alfred_DI_IP + ':' + process.env.Alfred_DI_Port;

setLogger(); // Configure the logger

//=========================================================
// Alexa skill
//=========================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = process.env.appid;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//=========================================================
// Intents
//=========================================================
var handlers = {
    'LaunchRequest': function() { // Say hello
        var promises     = [],
            intent_obj   = this,
            errorMessage = 'Sorry, there has been an error. <break time=\'500ms\'/> I am unable to process any requests at the moment.';
        
        promises.push(requestAPIdata(baseUrl + 'hello')); // push the hello request to the Promises array
        promises.push(requestAPIdata(baseUrl + 'help')); // push the help request to the Promises array
        
        Promise.all(promises)
        .then(function(resolved){
            if (resolved[0].body.code == 'sucess' && resolved[1].body.code == 'sucess') {
                intent_obj.emit(':ask', resolved[0].body.data, resolved[1].body.data);
            } else {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
                console.log('Alfred launch: Error getting data from alfred NLP api.');
            };
        })
        .catch(function(err) {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('Alfred launch: ' + err);
        });
    },
    'Unhandled': function() {
        logger.info ('Calling the Unhandled intent.');
        UnhandledIntent(this); // Process the intent
    },
    'Hello': function() {
        logger.info ('Calling the hello intent.');
        helloIntent(this); // Process the intent
    },
    'Help': function() {
        logger.info ('Calling the help intent.');
        helpIntent(this); // Process the intent
    },
    'Joke': function() {
        logger.info ('Calling the Joke intent.');
        jokeIntent(this); // Process the intent
    },
    'News': function() {
        logger.info ('Calling the News intent.');
        newsIntent(this); // Process the intent
    },
    'Time': function() {
        logger.info ('Calling the Time intent.');
        timeIntent(this); // Process the intent
    },
    'Snow': function() {
        logger.info ('Calling the Snow intent.');
        snowIntent(this); // Process the intent
    },



};

//=========================================================
// Helper functions
//=========================================================
function setLogger () {
    if (process.env.environment == 'live'){
        // Send logging to a file
        logger.add(logger.transports.File, { filename: 'Alfred.log', timestamp: function() { return dateFormat(new Date(), "dd mmm yyyy HH:MM")}, colorize: true });
        logger.remove(logger.transports.Console);
    } else {
        logger.remove(logger.transports.Console);
        logger.add(logger.transports.Console, {timestamp: function() { return dateFormat(new Date(), "dd mmm yyyy HH:MM") }, colorize: true});
    };
};

// Call a remote API to get data
function requestAPIdata (apiURL, userAgent) {
    var options = {
        'User-Agent': userAgent,
        method: 'GET',
        uri: apiURL,
        family: 4,
        resolveWithFullResponse: true,
        json: true
    };
    return rp(options);
};

function processResponseText (OutputText) {
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
// Intent functions
//=========================================================

// UnhandledIntent
function UnhandledIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to process your request.';
    logger.info ('No intent match.......');
    intentObj.emit(':tell', processResponseText(errorMessage)); // Send response back to alexa
};         

// Hello
function helloIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to process you hello request.',
        url          = baseUrl + '/hello?app_key=' + process.env.app_key;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            intentObj.emit(':tell', processResponseText(apiData));
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage));
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('hello: ' + err);
    });
};         

// Help
function helpIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to process you help request.',
        url          = baseUrl + '/help?app_key=' + process.env.app_key;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            intentObj.emit(':tell', processResponseText(apiData)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage));
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('help: ' + err);
    });
};         

// Joke
function jokeIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you a joke.',
        url          = baseUrl + '/joke?app_key=' + process.env.app_key;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            intentObj.emit(':tell', processResponseText(apiData));
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage));
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('joke: ' + err);
    });
};   

// News
function newsIntent (intentObj) {
    var errorMessage    = 'I seem to have an internal error. I am unable to tell you the news.',
        newsType        = intentObj.event.request.intent.slots.NewsType.value,
        outputHeadlines = 'Here are the headlines: ';

    if (typeof newsType !== 'undefined' && newsType !== null) { // Only process api accepted news types
        switch (newsType) {
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
                newsType = 'news';
            break;
        };
    } else {
        newsType = 'news';
    };

    // Construct url
    var url = baseUrl + '/news?app_key=' + process.env.app_key + '&news_type=' + newsType;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data

            apiData.forEach(function(value) {
                outputHeadlines = outputHeadlines + value.title + '. ';
            });
            intentObj.emit(':tell', processResponseText(outputHeadlines)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('news: ' + err);
    });
};   

// Time
function timeIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you the time.',
        location     = intentObj.event.request.intent.slots.Location.value;

    if (typeof location !== 'undefined' && location !== null) {
        location = '&location=' + location;
    } else {
        location = '';
    };

    // Construct url
    var url = baseUrl + '/whatisthetime?app_key=' + process.env.app_key + location;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            intentObj.emit(':tell', processResponseText(apiData)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('time: ' + err);
    });
};   

// Will it snow
function snowIntent (intentObj) {
    var errorMessage      = 'I seem to have an internal error. I am unable to tell you if it will snow.',
        location          = intentObj.event.request.intent.slots.Location.value,
        when              = intentObj.event.request.intent.slots.When.value,
        willItSnowMessage = '',
        locationMsg       = '.';

    if (typeof location !== 'undefined' && location !== null) {
        locationMsg = ' in ' + location + '.'; 
        location    = '&location=' + location;
    } else {
        location = '';
    };

    // Construct url
    var url = baseUrl + '/weather/willitsnow?app_key=' + process.env.app_key + location;

logger.info ('when: '+when)

    if (typeof when == 'undefined' || when == null || when == '') {
        when = 'today';
    };

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            switch (when) {
                case 'today':
                    if (apiData.going_to_snow){ // If the volume of snow is >0 it's snowing
                        willItSnowMessage = 'It\'s going to snow today' + locationMsg;
                    } else {
                        willItSnowMessage = 'It\'s not going to snow today' + locationMsg;
                    };
                    break;
                case 'tomorrow':
                    if (apiData.going_to_snow){ // If the volume of snow is >0 it's snowing
                        willItSnowMessage = 'It\'s going to snow tomorrow' + locationMsg;
                    } else {
                        willItSnowMessage = 'It\'s not going to snow tomorrow' + locationMsg;
                    };
                    break;
                default:
                    if (apiData.going_to_snow){ // If the volume of snow is >0 it's snowing
                        willItSnowMessage = 'In the next 5 days it is going to snow' + locationMsg;
                    } else {
                        willItSnowMessage = 'In the next 5 days it is not going to snow' + locationMsg;
                    };
                    break;
            };
            intentObj.emit(':tell', processResponseText(willItSnowMessage)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('snow: ' + err);
    });
};