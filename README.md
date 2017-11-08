# Play on Docker

```
$ git clone git@github.com:dongri/play.git
$ cd play/server
$ docker-compose up

$ open http://localhost:5000/play
```

# Play on macOS

### Python
```
$ brew install python3
$ ln -s python3 python
$ ln -s pip3 pip

$ pip install flask
$ pip install redis
$ pip install flask-sse
```

### Redis
```
$ brew install redis
```

### ENV
```
$ vim ~/.bashrc
export GOOGLE_API_KEY=****
export PLAY_SLACK_URL=**** (optional)
```
Google Key

https://developers.google.com/youtube/registering_an_application

Slack Webhook URL

https://{team}.slack.com/apps/manage/custom-integrations

### Play
```
$ python run.py
```

http://localhost:5000

<kbd>
<img src="https://raw.githubusercontent.com/dongri/play/master/screenshots/ss1.png" width="800">
</kbd>
<kbd>
<img src="https://raw.githubusercontent.com/dongri/play/master/screenshots/ss2.png" width="800">
</kbd>
<kbd>
<img src="https://raw.githubusercontent.com/dongri/play/master/screenshots/ss3.png" width="800">
</kbd>

### Slack
<kbd>
<img src="https://raw.githubusercontent.com/dongri/play/master/screenshots/slack.png" width="400">
</kbd>

# macOS
```
$ git clone git@github.com:dongri/play.git
$ cd play/electron
$ vim index.html
 src="http://localhost:5000/static/electron/index.html"

$ electron .

$ ./package.sh
$ ./build.sh

```

<img src="https://raw.githubusercontent.com/dongri/play/master/screenshots/macOS.png" width="400">
