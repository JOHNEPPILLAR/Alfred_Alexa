// Setup a local test server and point Alexa simulator to the test server
const restify = require('restify'),
      dotenv  = require('dotenv');

var bst    = require('bespoken-tools'),
    server = null,
    alexa  = null;

// Load env vars
dotenv.load()

// Process root api request
function processRequest(req, res, next) {
    alexa.launched(function (error) {                
        if (typeof error !== 'undefined' && error !== null) {
            console.error("Error: " + error);
        } else {
            if (typeof req.query.input !== 'undefined' && req.query.input !== null) {
                console.log('Asking the alexa skill: ' + req.query.input);
                alexa.spoken(req.query.input, function (error, response, request) {
                    if (typeof error !== 'undefined' && error !== null) {
                        res.send(error);  
                        console.error("Error: " + error);
                    } else {
                        res.send(response.response);
                    };
                });
            }else{
                res.send('Input param was missing.');  
            };
        };
    });
};

// Setup lambda skill server
server = new bst.LambdaServer('./src/index.js', 10000, true),
alexa  = new bst.BSTAlexa('http://localhost:10000?disableSignatureCheck=true', './speechAssets/IntentSchema.json','./speechAssets/SampleUtterances.txt','JP');
// Start the Alexa skill under the lambda server
server.start(function () {
    console.log ('Lambda server started');
    alexa.start(function (error) {
        console.log ('Skill started, ready to accept requests');
    });
});

// Restify server Init
const APIserver = restify.createServer({
    name    : process.env.APINAME,
    version : process.env.VERSION,
});
// Middleware
APIserver.use(restify.jsonBodyParser({ mapParams: true }));
APIserver.use(restify.acceptParser(APIserver.acceptable));
APIserver.use(restify.queryParser({ mapParams: true }));
APIserver.use(restify.fullResponse());
// Map the root to processReauest function for processing
APIserver.get('/', processRequest);
// Start server and listen to messqges
//APIserver.listen(process.env.PORT, function() {
APIserver.listen(3977, function() {
   console.log('Alexa local skill test server listening to %s', APIserver.name, APIserver.url);
});
