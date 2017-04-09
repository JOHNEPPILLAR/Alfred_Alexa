#!/bin/bash
echo "The following node processes were found:"
ps aux | grep " node " | grep -v grep
nodepids=$(ps aux | grep " node app.js " | grep -v grep | cut -c10-15)
echo "OK, so we will stop these process/es now..."
kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')
echo "Done"

echo "Now setting node to v6.10.0"
source ~/.nvm/nvm.sh
nvm use 6.10.0

echo "Removing the node modules folder and installing the latest"
#rm -rf node_modules
#npm install

echo "Now run the alexa skill local test server"
#nodemon server.js
node server.js