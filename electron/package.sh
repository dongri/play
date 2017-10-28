#!/bin/sh
OUT="/Users/dongri/Desktop/"
ICON="./img/icon.icns"
OPTION="--platform=darwin --arch=x64"
VERSION=1.0.4

electron-packager . Play ${OPTION} --icon=${ICON} --version=${VERSION} --out=${OUT}
