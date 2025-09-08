#!/bin/sh

screen -dmS test bash -c ". ./colors.sh; trap bash SIGINT; (./start-dev.sh ; bash);"
