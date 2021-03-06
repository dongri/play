# Play on Docker

```
$ git clone git@github.com:dongri/play.git
$ cd play
$ docker-compose up

$ open http://localhost:50002/play
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

### Nginx
```
upstream play {
    server localhost:5000;
}
server {
    listen 80;
    server_name play.hackerth.com;
    location / {
       proxy_pass http://play;
       proxy_read_timeout 24h;
       proxy_http_version 1.1;
       proxy_set_header Connection "";
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_buffering off;
       proxy_cache off;
       chunked_transfer_encoding off;
    }
}
```

### Redis
```
$ redis-cli
$ keys "*"
$ lrange dopelist 0 -1
$ rpop dopelist
$ lpop dopelist
```

### Play
```
$ python run.py
```

http://localhost:50002/play

# macOS app
https://github.com/dongri/play-macos


