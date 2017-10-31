#!/bin/sh

APP_PATH="/Users/${USER}/Desktop/Play-darwin-x64/Play.app"
OUT="/Users/${USER}/Desktop"
ICON="${PWD}/img/icon.icns"

cd ${OUT}

electron-installer-dmg ${APP_PATH} --icon=${ICON} Play
