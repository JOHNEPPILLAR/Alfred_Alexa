'use strict';

//=========================================================
// TODO 
/*

Finish off launch request
Get custom slot catchall working

*/
//=========================================================

const Alexa  = require('alexa-sdk'),
      rp     = require('request-promise'),
      dotenv = require('dotenv');

dotenv.load() // Load env vars

var APP_ID      = process.env.appid,
    api_app_key = process.env.app_key,
    url         = 'http://' + process.env.Alfred_DI_IP + ':' + process.env.Alfred_DI_Port + '/?app_key=' + api_app_key + '&user_request=';

//=========================================================
// Helper functions
//=========================================================

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
    'LaunchRequest': function() { // Say hello
        // TO DO
        this.emit(':ask', 'call to alfred api for hello', 'call to alfred with help');
    },
    'MainIntent': function() { // Pass all requests on the Alfred_NLP api
        var intent_obj   = this,
            errorMessage = 'Sorry, there has been an error. <break time=\'500ms\'/> I am unable to process any requests at the moment.',
            userRequest  = this.event.request.intent.slots.CatchAll.value;

console.log(this.event.request.intent.slots.CatchAll.value)

        if (typeof userRequest !== 'undefined' && userRequest !== null) { // Make sure param is not empty

            url = url + userRequest; // Append the request to the url

            requestAPIdata(url) // Go get the data from Alfred
            .then(function(apiObj) {
                var apiData = apiObj.body.data;
                if (apiObj.body.code == 'sucess') {
                    intent_obj.emit(':tell', apiData); // Send response back to alexa
                } else {
                    intent_obj.emit(':tell', errorMessage); // Send response back to alexa
                };
            })
            .catch(function(err) {
                intent_obj.emit(':tell', errorMessage); // Send response back to alexa
                console.log('Alfred error: ' + err);
            });
        } else {
            intent_obj.emit(':tell', errorMessage); // Send response back to alexa
            console.log('Alfred error: there was no param.');
        };
    }
};