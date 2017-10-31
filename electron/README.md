# Development
```
$ npm install -g electron
$ electron -v
v1.7.9
$ electron .
```

# Create app file
```
$ npm install -g electron-packager
$ ./package.sh
```

# Create DMG
```
$ pyenv global system
$ python -V           
Python 2.7.10

$ npm install -g electron-installer-dmg
$ cd ~/Desktop
$ electron-installer-dmg ./Play-darwin-x64/Play.app Play
$ ll 
drwxr-xr-x   7 dongri  staff   238B Oct 31 14:28 Play-darwin-x64
-rw-r--r--@  1 dongri  staff    44M Oct 31 14:29 Play.dmg
```

Resource busyと言われた時は
```
$ sudo diskutil umount "/Volumes/Play"
```