#!/bin/sh

screen -dmS libergrid bash -c ". ./colors.sh; trap bash SIGINT; (./start-dev.sh ; bash);"
