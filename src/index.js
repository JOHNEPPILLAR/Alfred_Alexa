'use strict';
var Alexa  = require('alexa-sdk'),
    APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    //alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
//    'LaunchRequest': function () {
//        this.emit('HelloIntent');
//    },
    'HelloIntent': function () {
//TODO

        this.emit(':tell', "hello there.");




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