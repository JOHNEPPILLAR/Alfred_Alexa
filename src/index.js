'use strict';

const Alexa  = require('alexa-sdk'),
      rp     = require('request-promise'),
      dotenv = require('dotenv');

dotenv.load() // Load env vars

var APP_ID      = process.env.appid,
    api_app_key = process.env.app_key,
    baseUrl     = 'http://' + process.env.Alfred_DI_IP + ':' + process.env.Alfred_DI_Port + '/?app_key=' + api_app_key + '&user_request=';

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
    'MainIntent': function() { // Pass all requests on the Alfred_NLP api
        var intent_obj   = this,
            errorMessage = 'Sorry, there has been an error. <break time=\'500ms\'/> I am unable to process any requests at the moment.',
            userRequest  = this.event.request.intent.slots.CatchAll.value;

        if (typeof userRequest !== 'undefined' && userRequest !== null) { // Make sure param is not empty

            var url = baseUrl + userRequest; // Append the request to the url

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