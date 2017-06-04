'use strict';

//
// TO DO
//
// Finish off commute intent
//

const Alexa      = require('alexa-sdk'),
      rp         = require('request-promise'),
      dotenv     = require('dotenv'),
      logger     = require('winston'),
      dateFormat = require('dateformat'),
      Speech     = require('ssml-builder');

dotenv.load() // Load env vars

var baseUrl = 'http://' + process.env.Alfred_DI_IP + ':' + process.env.Alfred_DI_Port;

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
    'Rain': function() {
        logger.info ('Calling the Rain intent.');
        rainIntent(this); // Process the intent
    },
    'Weather': function() {
        logger.info ('Calling the Weather intent.');
        weatherIntent(this); // Process the intent
    },
    'NextBus': function() {
        logger.info ('Calling the Next Bus intent.');
        nextBusIntent(this); // Process the intent
    },
    'NextTrain': function() {
        logger.info ('Calling the Next Train intent.');
        nextTrainIntent(this); // Process the intent
    },
    'BusStatus': function() {
        logger.info ('Calling the Bus Status intent.');
        busStatusIntent(this); // Process the intent
    },
    'TubeStatus': function() {
        logger.info ('Calling the Tube Status intent.');
        tubeStatusIntent(this); // Process the intent
    },
    'Commute': function() {
        logger.info ('Calling the Commute intent.');
        commuteIntent(this); // Process the intent
    },
    'TVOff': function() {
        logger.info ('Calling the TV off intent.');
        TVOffIntent(this); // Process the intent
    },
    'AMAZON.HelpIntent': function () {
        logger.info ('Calling the help intent.');
        helpIntent(this); // Process the intent
    },        
    'AMAZON.CancelIntent': function () {
        logger.info ('Calling the Cancel intent.');
        stopIntent(this); // Process the intent
    },
    'AMAZON.StopIntent': function () {
        logger.info ('Calling the Stop intent.');
        stopIntent(this); // Process the intent
    }
};

//=========================================================
// Helper functions
//=========================================================
function setLogger () {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {timestamp: function() { return dateFormat(new Date(), "dd mmm yyyy HH:MM") }, colorize: true});
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

function addDays (date, amount) {
    var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        d = new Date(),
        tzOff2;

    t += (1000 * 60 * 60 * 24) * amount;
    d.setTime(t);

    tzOff2 = d.getTimezoneOffset() * 60 * 1000;
    if (tzOff != tzOff2) {
        var diff = tzOff2 - tzOff;
        t += diff;
        d.setTime(t);
    };
    return d;
};

function getByDate (jsonObj, date) {
    return jsonObj.filter(function (el) {
        return dateFormat(el, "yyyy-mm-dd") == dateFormat(date, "yyyy-mm-dd");
    });
};

//=========================================================
// Intent functions
//=========================================================

// UnhandledIntent
function UnhandledIntent (intentObj) {
    var errorMessage = 'I do not know that type of request. Please try again.';
    logger.info ('No intent matched.......');
    intentObj.emit(':tell', errorMessage); // Send response back to alexa
};         

// Stop, Cancel 
function stopIntent (intentObj) {
    var outputText = '',
        hour       = new Date().getHours();
    
    switch (hour) {
    case 0: case 1: case 2: case 3: case 4: case 5:
        outputText = 'OK. Have a pleasant sleep.';
        break;
    case 6: case 7: case 8: case 9: case 10: case 11: case 12:
        outputText = 'OK. Have a pleasant day.';
    case 13: case 14: case 15: case 16:
        outputText = 'OK. Have a pleasant afternoon.';
    case 17: case 18: case 19:
        outputText = 'OK. Have a pleasant evening.';
    default:
        outputText = 'OK. Have a pleasant night.';
        break;
    };
    intentObj.emit(':tell', processResponseText(outputText));
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
        dateTomorrow      = dateFormat(addDays(new Date(), 1), "yyyy-mm-dd"),
        dateToday         = dateFormat(Date.now(), "yyyy-mm-dd"),
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

    if (typeof when !== 'undefined' && when !== null) {
        switch (when) {
            case dateToday:
                when = 'today';
                break;
            case dateTomorrow:
                when = 'tomorrow';
                break;
            default:
                when = 'today';
            break;
        };
    } else {
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

// Will it rain
function rainIntent (intentObj) {
    var errorMessage      = 'I seem to have an internal error. I am unable to tell you if it will rain.',
        location          = intentObj.event.request.intent.slots.location.value,
        when              = intentObj.event.request.intent.slots.when.value,
        dateTomorrow      = dateFormat(addDays(new Date(), 1), "yyyy-mm-dd"),
        dateToday         = dateFormat(Date.now(), "yyyy-mm-dd"),
        willItRainMessage = '',
        locationMsg       = '.';

    if (typeof location !== 'undefined' && location !== null) {
        locationMsg = ' in ' + location + '.'; 
        location    = '&location=' + location;
    } else {
        location = '';
    };

    // Construct url
    var url = baseUrl + '/weather/willitrain?app_key=' + process.env.app_key + location;

    if (typeof when !== 'undefined' && when !== null) {
        switch (when) {
            case dateToday:
                when = 'today';
                break;
            case dateTomorrow:
                when = 'tomorrow';
                break;
            default:
                when = 'today';
            break;
        };
    } else {
        when = 'today';
    };

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            switch (when) {
                case 'today':
                    if (!apiData.going_to_rain){ // If the volume of rain is >0 it's raining
                        willItRainMessage = 'It\'s not going to rain today' + locationMsg;
                    } else {
                        var rainToday = getByDate(apiData.rain_days,dateToday),
                            now       = false,
                            morning   = false,
                            afternoon = false,
                            evening   = false,
                            night     = false;
                        rainToday.forEach(function(value) {
                            var ObjHR     = dateFormat(value, 'HH'),
                                CurrentHR = dateFormat(new Date(), 'HH');
                            if (ObjHR > CurrentHR) {
                                if(ObjHR >= 5 && ObjHR <= 11) morning = true
                                else if(ObjHR >= 12 && ObjHR <=16) afternoon = true 
                                else if(ObjHR >= 17 && ObjHR <=21) evening = true
                                else night = true;
                            } else now = true;
                        });
                        if (now) willItRainMessage = 'It\'s raining right now.';
                        if (night) willItRainMessage = 'It\'s going to rain to night.';
                        if (evening) willItRainMessage = 'It\'s going to rain this evening.';
                        if (afternoon) willItRainMessage = 'It\'s going to rain this afternoon.';
                        if (morning) willItRainMessage = 'It\'s going to rain this morning.';
                    };
                    break;
                case 'tomorrow':
                    if (!apiData.going_to_rain){ // If the volume of rain is >0 it's raining
                        willItRainMessage = 'It\'s not going to rain tomorrow' + locationMsg;
                    } else {
                        var rainTomorrow  = getByDate(apiData.rain_days,dateTomorrow),
                            morning       = false,
                            afternoon     = false,
                            evening       = false,
                            night         = false;
                        rainTomorrow.forEach(function(value) {
                            var ObjHR = dateFormat(value, 'HH');
                            if(ObjHR >= 5 && ObjHR <= 11) morning = true
                            else if(ObjHR >= 12 && ObjHR <=16) afternoon = true 
                            else if(ObjHR >= 17 && ObjHR <=21) evening = true
                            else night = true;
                        });
                        if (night) willItRainMessage = 'It\'s going to rain tomorrow night.';
                        if (evening) willItRainMessage = 'It\'s going to rain tomorrow evening.';
                        if (afternoon) willItRainMessage = 'It\'s going to rain tomorrow afternoon.';
                        if (morning) willItRainMessage = 'It\'s going to rain tomorrow morning.';
                        if (morning && afternoon && evening && night) willItRainMessage = 'It\'s going to rain all day tomorrow.';
                    };
                    break;
                default:
                    if (apiData.going_to_rain){ // If the volume of rain is >0 it's raining
                        willItRainMessage = 'In the next 5 days it is going to rain' + locationMsg;
                    } else {
                        willItRainMessage = 'In the next 5 days it is not going to rain' + locationMsg;
                    };
                    break;
            };
            intentObj.emit(':tell', processResponseText(willItRainMessage)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('rain: ' + err);
    });
};

// Weather
function weatherIntent (intentObj) {
    var errorMessage   = 'I seem to have an internal error. I am unable to tell you the weather.',
        location       = intentObj.event.request.intent.slots.Location.value,
        when           = intentObj.event.request.intent.slots.When.value,
        dateTomorrow   = dateFormat(addDays(new Date(), 1), "yyyy-mm-dd"),
        dateToday      = dateFormat(Date.now(), "yyyy-mm-dd"),
        locationMsg    = '',
        weatherMessage = '';

    if (typeof location !== 'undefined' && location !== null) {
        locationMsg = ' in ' + location; 
        location    = '&location=' + location;
    } else {
        location = '';
    };

    if (typeof when !== 'undefined' && when !== null) {
        switch (when.toLowerCase()) {
            case dateToday:
                when = 'today';
                break;
            case dateTomorrow:
                when = 'tomorrow';
                break;
            default:
                when = 'tomorrow';
                break;
        };
    } else {
        when = 'today';
    };

    // Construct url
    var url = baseUrl + '/weather/' + when + '?app_key=' + process.env.app_key + location;

    // Call the url and process data
    requestAPIdata(url) // Call the api
    .then(function(apiObj) {
        var apiData = apiObj.body.data;
        if (apiObj.body.code == 'sucess') { // if sucess process the data
            switch (when) {
                case 'today':
                    weatherMessage = 'Currently' + locationMsg +
                                        ' it\'s ' + apiData.CurrentTemp.toFixed(0) + ' degrees with ' + 
                                        apiData.Summary + '.';
                    break;
                case 'tomorrow':
                    weatherMessage = 'Tomorrow morning' + locationMsg + ' will be ' + apiData.tomorrow_morning.Summary +
                                        ' with a high of ' + apiData.tomorrow_morning.MaxTemp.toFixed(0) +
                                        ' and a low of ' + apiData.tomorrow_morning.MinTemp.toFixed(0) + '.' + 
                                        ' Tomorrow afternoon will be ' + apiData.tomorrow_evening.Summary +
                                        ' and an average of ' + apiData.tomorrow_evening.Temp.toFixed(0) + ' degrees.';
                    break;
                default:
                    // TO DO
                    weatherMessage = 'To do.';
                    break;
            };
            intentObj.emit(':tell', processResponseText(weatherMessage)); 
        } else { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
        };
    })
    .catch(function(err) { // if error return a nice message
        intentObj.emit(':tell', processResponseText(errorMessage)); 
        logger.error('weather: ' + err);
    });
};

// Next bus
function nextBusIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you when the next bus will be.',
        busRoute = '&bus_route=380';

    // Construct url
    var url = baseUrl + '/travel/nextbus?app_key=' + process.env.app_key + busRoute;

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
        logger.error('nextBus: ' + err);
    });
};

// Next Train
function nextTrainIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you when the next train will be.',
        route        = intentObj.event.request.intent.slots.TrainDestination.value;

    if (typeof route !== 'undefined' && route !== null) {
        switch (route.toLowerCase()) {
            case 'london bridge':
                route = '&train_destination=CHX';
                break;
            case 'charing cross':
                route = '&train_destination=CHX';
                break;
            case 'cannon street':
                route = '&train_destination=CST';
                break;
            default:
                route = '&train_destination=CHX';
            break;
        };
    } else {
        route = '&train_destination=CHX';
    };

    // Construct url
    var url = baseUrl + '/travel/nexttrain?app_key=' + process.env.app_key + route;

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
        logger.error('Next Train: ' + err);
    });
};

// Bus status
function busStatusIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you the bus status.',
        route        = intentObj.event.request.intent.slots.BusNumber.value;

    if (typeof route !== 'undefined' && route !== null) {
        route = '&route=' + route;
    } else {
        route = '&route=';
    };

    // Construct url
    var url = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + route;

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
        logger.error('Bus Status: ' + err);
    });
};

// Tube status
function tubeStatusIntent (intentObj) {
    var errorMessage = 'I seem to have an internal error. I am unable to tell you the tube line status.',
        route        = intentObj.event.request.intent.slots.TubeLine.value;

    if (typeof route !== 'undefined' && route !== null) {
        route = '&route=' + route;
    } else {
        route = '&route=';
    };

    // Construct url
    var url = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + route;

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
        logger.error('Tube Status: ' + err);
    });
};

// Commute status
function commuteIntent (intentObj) {
    var errorMessage    = 'I seem to have an internal error. I am unable to work out your commute.',
        promises        = [],
        tubeCentralUrl  = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + '&raw=true&route=central',
        tubeBakerlooUrl = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + '&raw=true&route=bakerloo',
        tubeCircleUrl   = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + '&raw=true&route=circle',
        tubeJubileeUrl   = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + '&raw=true&route=jubilee',
        number9busUrl   = baseUrl + '/travel/bustubestatus?app_key=' + process.env.app_key + '&raw=true&route=9',
        trainCHXUrl     = baseUrl + '/travel/nexttrain?app_key=' + process.env.app_key + '&raw=true&train_destination=CHX',
        trainCSTUrl     = baseUrl + '/travel/nexttrain?app_key=' + process.env.app_key + '&raw=true&train_destination=CST',
        outputText      = '',
        distruptions    = false,
        franCommute     = false;

    if (!franCommute){ // JP's commute
        promises.push(requestAPIdata(trainCSTUrl));
        promises.push(requestAPIdata(trainCHXUrl));
        promises.push(requestAPIdata(tubeCentralUrl));
        promises.push(requestAPIdata(tubeJubileeUrl));

        // TO DO
        Promise.all(promises)
        .then(function(resolved){
            if (resolved[0].body.code == 'sucess' && 
                resolved[1].body.code == 'sucess' &&
                resolved[2].body.code == 'sucess' &&
                resolved[3].body.code == 'sucess') {

                if (resolved[0].body.data.disruptions == false && resolved[2].body.data.disruptions == false) { // CST Trains and Central line are ok
                    outputText = resolved[0].body.data.message;
                };
                if (resolved[0].body.data.disruptions == true && // Problem on CST, CHX trains and Jubilee
                    resolved[1].body.data.disruptions == true &&
                    resolved[3].body.data.disruptions == true) { 
                    outputText = 'There are disruptions reported on all trains and the Jubilee line. I would check Southeastern and city mapper for more information.';
                };
                if (resolved[0].body.data.disruptions == true && // Problem on CST, CHX trains. Jubilee line ok
                    resolved[1].body.data.disruptions == true &&
                    resolved[3].body.data.disruptions == false) { 
                    outputText = 'There are disruptions reported on all trains, so I sugest you get the tube as the Jubilee line look ok. I would check Southeastern and city mapper just in case though.';
                };
                if (resolved[0].body.data.disruptions == true && // Problem on CST, CHX is ok
                    resolved[1].body.data.disruptions == false) { 
                    outputText = 'There are disruptions reported on trains to Cannon Street, so I suggest going to Charing Cross today. But I would check Southeastern just in case.';
                };
                if (resolved[0].body.data.disruptions == false && // Trains are ok but problem on Central line
                    resolved[1].body.data.disruptions == false &&
                    resolved[2].body.data.disruptions == true) { 
                    outputText = 'There are disruptions reported on the central line. I suggest you go to Charing Cross today. But I would check Southeastern just in case.';
                };
                intentObj.emit(':tell', processResponseText(outputText)); 
            } else {
                intentObj.emit(':tell', processResponseText(errorMessage)); 
                logger.error('Commute: ' + err);
            };
        })
        .catch(function(err) { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
            logger.error('Commute: ' + err);
        });
    } else { // Fran's commute
        promises.push(requestAPIdata(trainCHXUrl));
        promises.push(requestAPIdata(tubeJubileeUrl));
        promises.push(requestAPIdata(number9busUrl));

        Promise.all(promises)
        .then(function(resolved){
            if (resolved[0].body.code == 'sucess' && 
                resolved[1].body.code == 'sucess' &&
                resolved[2].body.code == 'sucess') {

                if (resolved[0].body.data.disruptions == false) { // Trains are running ok
                    outputText = resolved[0].body.data;
                };
                if (resolved[0].body.data.disruptions == true && resolved[1].body.data.disruptions == true) { // Problem on trains and tube
                    outputText = 'There are disruptions reported for trains to Charing Cross and the Jubilee line. Please check Southeastern and city mapper for more information.';
                };
                if (resolved[0].body.data.disruptions == true && resolved[1].body.data.disruptions == false) { // Problems on train only
                    outputText = 'There are disruptions reported for trains to Charing Cross, however the Jubilee line currently looks ok.';
                };
                if (resolved[2].body.data == false) { // No 9 bus is ok
                    outputText = outputText + ' There are no disruptions on the number 9 bus.';
                } else { // No 9 bus is not ok
                    outputText = outputText + ' There are reported disruptions on the number 9 bus.';
                };
                intentObj.emit(':tell', processResponseText(outputText)); 
            } else {
                intentObj.emit(':tell', processResponseText(errorMessage)); 
                logger.error('Commute: ' + err);
            };
        })
        .catch(function(err) { // if error return a nice message
            intentObj.emit(':tell', processResponseText(errorMessage)); 
            logger.error('Commute: ' + err);
        });
    };
};

// TV off
function TVOffIntent (intentObj) {
    const errorMessage = 'I seem to have an internal error. I am unable to turn off the TV.'
          
    var room     = null,
        deviceID = null;

    try {
        deviceID = intentObj.event.context.System.device.deviceId;
    } catch (error) {
        logger.info ('No deviceID information in Alexa payload')
    };

    switch (deviceID) {
        case process.env.livingRoomDeviceID:
            var url = baseUrl + '/tv/turnoff?app_key=' + process.env.app_key; // Construct url
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
                logger.error('TV off error: ' + err);
            });
            break;
        default:
            intentObj.emit(':tell', processResponseText('Sorry. I cannot do that because there is not a TV in this room.'));
            break;
    };
};
