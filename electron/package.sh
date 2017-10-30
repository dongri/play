#!/bin/sh
OUT="/Users/dongri/Desktop/"
ICON="./img/icon.icns"
OPTION="--platform=darwin --arch=x64"
VERSION=1.0.4

rm -rf ${OUT}Play-darwin-x64
electron-packager . Play ${OPTION} --icon=${ICON} --version=${VERSION} --out=${OUT}
