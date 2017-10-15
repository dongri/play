import os
import time
import redis

from flask import render_template
from flask import request
from flask import jsonify

from play import app
from play import util

if os.getenv("REDISTOGO_URL")!=None:       
    r = redis.from_url(os.getenv("REDISTOGO_URL"))
else:
    HOST='localhost'
    PORT=6379
    DB=0
    r=redis.Redis(host=HOST, port=PORT, db=DB)

REDIS_KEY = "playlist"
DIVISION_KEY = "<fuck>"

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
    g_vid = list[0].split(DIVISION_KEY)[0]
    return jsonify(list)

@app.route('/post', methods=['POST'])
def post():
    vid = request.form["video_id"]
    items = util.GetYoutubeItems(vid)
    for result_obj in items:
        duration = util.YTDurationToSeconds(result_obj["contentDetails"]["duration"])
        if duration < 600:
            title = result_obj["snippet"]["title"]
            r.rpush(REDIS_KEY, vid+DIVISION_KEY+title)
    return jsonify(play_list())

@app.route('/pop', methods=['POST'])
def pop():
    global g_sec
    vid = request.form["video_id"]
    c = r.llen(REDIS_KEY)
    if c > 1:
        item = r.lindex(REDIS_KEY, 0)
        if item.decode('utf-8').split(DIVISION_KEY)[0] == vid:
            r.lpop(REDIS_KEY)
    g_sec = 0
    return jsonify(play_list())

@app.route('/now', methods=['GET'])
def now():
    global g_vid, g_sec
    if g_vid == "":
        list = play_list()
        g_vid = list[0].split(DIVISION_KEY)[0]
    if g_sec != 0:
        diff = int(time.time() - g_sec)
    else:
        diff = g_sec
    dict = {"vid":g_vid, "sec":diff}
    return jsonify(dict)

def play_list():
    play_list = r.lrange(REDIS_KEY, 0, -1)
    list = []
    for l in play_list:
        list.append(l.decode('utf-8'))
    return list
