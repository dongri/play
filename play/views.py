import os
import time
import redis
import random

from flask import render_template
from flask import request
from flask import jsonify

from play import app
from play import util
from play import config

if os.getenv("REDISTOGO_URL") != None:
    r = redis.from_url(os.getenv("REDISTOGO_URL"))
elif os.getenv("PLAY_ENV") == "docker":
    HOST='play_redis'
    PORT=6379
    DB=0
    r=redis.Redis(host=HOST, port=PORT, db=DB)
else:
    HOST='localhost'
    PORT=6379
    DB=0
    r=redis.Redis(host=HOST, port=PORT, db=DB)

g_vid = ""
g_sec = 0

@app.route("/")
def index():
    return render_template('index.html', message="/play")

@app.route('/play')
def play():
    return render_template('play.html')

@app.route('/list', methods=['GET'])
def list():
    global g_vid, g_sec
    if g_sec == 0:
        g_sec = time.time()
    list = play_list()
    if len(list) == 0:
        r.rpush(config.REDIS_KEY, random_video())
        list = play_list()
    g_vid = list[0].split(config.DIVISION_KEY)[0]
    return jsonify(list)

@app.route('/post', methods=['POST'])
def post():
    vid = request.form["video_id"]
    items = util.GetYoutubeItems(vid)
    for result_obj in items:
        duration = util.YTDurationToSeconds(result_obj["contentDetails"]["duration"])
        if duration < 600:
            title = result_obj["snippet"]["title"]
            r.rpush(config.REDIS_KEY, vid+config.DIVISION_KEY+title)
    return jsonify(play_list())

@app.route('/pop', methods=['POST'])
def pop():
    global g_sec
    vid = request.form["video_id"]
    item = r.lindex(config.REDIS_KEY, 0)
    if item.decode('utf-8').split(config.DIVISION_KEY)[0] == vid:
        r.lpop(config.REDIS_KEY)
        list = play_list()
        if len(list) > 0:
            title = list[0].split(config.DIVISION_KEY)[1]
            util.PostToSlack("Now playing - " + title)
    if r.llen(config.REDIS_KEY) <= 0:
        r.rpush(config.REDIS_KEY, random_video())
    list = play_list()
    g_sec = 0
    return jsonify(list)

@app.route('/now', methods=['GET'])
def now():
    global g_vid, g_sec
    if g_vid == "":
        list = play_list()
        g_vid = list[0].split(config.DIVISION_KEY)[0]
    if g_sec != 0:
        diff = int(time.time() - g_sec)
    else:
        diff = g_sec
    dict = {"vid":g_vid, "sec":diff}
    return jsonify(dict)

@app.route('/dope', methods=['POST'])
def dope():
    video_id = request.form["video_id"]
    list = play_list()
    for i in list:
        t = i.split(config.DIVISION_KEY)
        vid = t[0]
        title = t[1]
        if vid == video_id:
            for l in dope_list():
                lvid = l.split(config.DIVISION_KEY)[0]
                if lvid == video_id:
                    return jsonify()
            r.rpush(config.REDIS_DOPE_KEY, vid+config.DIVISION_KEY+title)
    return jsonify()


@app.route('/api/queue', methods=['POST'])
def api_queue():
    vid = util.GetVideoId(request.json["youtube_url"])
    items = util.GetYoutubeItems(vid)
    for result_obj in items:
        duration = util.YTDurationToSeconds(result_obj["contentDetails"]["duration"])
        if duration < 600:
            title = result_obj["snippet"]["title"]
            r.rpush(config.REDIS_KEY, vid+config.DIVISION_KEY+title)
            return jsonify(result="OK", title=title, video_id=vid)
    return jsonify(result="NG", title="")

@app.route('/api/list', methods=['GET'])
def api_list():
    list = play_list()
    pl = []
    for l in list:
        t = l.split(config.DIVISION_KEY)
        vid = t[0]
        title = t[1]
        song = {"video_id": vid, "title": title}
        pl.append(song)
    return jsonify(pl)

@app.route('/api/dope', methods=['POST'])
def api_dope():
    global g_vid
    video_id = g_vid
    list = play_list()
    for i in list:
        t = i.split(config.DIVISION_KEY)
        vid = t[0]
        title = t[1]
        if vid == video_id:
            for l in dope_list():
                lvid = l.split(config.DIVISION_KEY)[0]
                if lvid == video_id:
                    return jsonify(result="OK", title=title)
            r.rpush(config.REDIS_DOPE_KEY, vid+config.DIVISION_KEY+title)
    return jsonify(result="OK", title=title)

def play_list():
    play_list = r.lrange(config.REDIS_KEY, 0, -1)
    list = []
    for l in play_list:
        list.append(l.decode('utf-8'))
    return list

def dope_list():
    dope_list = r.lrange(config.REDIS_DOPE_KEY, 0, -1)
    list = []
    for l in dope_list:
        list.append(l.decode('utf-8'))
    return list

def random_video():
    list = dope_list()
    if len(list) <= 0:
        return config.DEFAULT_VALUE
    r = random.randint(0,len(list)-1)
    return list[r]
