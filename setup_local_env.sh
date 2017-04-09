#!/bin/bash
echo "Install node v6.10.0"
source ~/.nvm/nvm.sh
nvm install 6.10.0

echo "Install bespoken tools"
npm install bespoken-tools -g
