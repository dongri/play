# Play on Docker

```
$ git clone git@github.com:dongri/play.git
$ cd play
$ docker-compose up

$ open http://localhost:5000/play
```

# Play on macOS

### Python
```
$ brew install pyenv
$ pyenv install -v 3.6.1
$ pyenv global 3.6.1
$ python -V
Python 3.6.1

$ pip install flask
$ pip install redis
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

http://localhost:5000/play

<img src="https://raw.githubusercontent.com/dongri/play/master/play/static/screenshots.png">

### Slack
<img src="https://raw.githubusercontent.com/dongri/play/master/play/static/slack.png" width="500">
