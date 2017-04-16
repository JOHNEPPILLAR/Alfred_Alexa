#!/bin/bash

#echo "The following nodemon processes were found:"
#ps aux | grep " node /usr/local/bin/nodemon " | grep -v grep
#nodepids=$(ps aux | grep " node /usr/local/bin/nodemon " | grep -v grep | cut -c10-15)
#echo "OK, so we will stop these process/es now..."
#kill -9 $(ps aux | grep '\snode /usr/local/bin/nodemon\s' | awk '{print $2}')
#echo "Done"

echo "Now setting node to v6.10.0"
source ~/.nvm/nvm.sh
nvm use 6.10.0

echo "Now run the alexa skill local test server"
nodemon ./localTestServer/server.js
#node server.js