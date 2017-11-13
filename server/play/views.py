import os
import time
import redis
import random

from datetime import datetime, timezone, timedelta

from flask import render_template
from flask import request
from flask import jsonify
from flask import send_file
from flask import current_app
from flask_sse import sse

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
g_dur = 0

@app.route("/", methods=['GET'])
def index():
    return render_template('index.html', message="/play")

@app.route("/download/osx", methods=['GET'])
def download_osx():
    path = os.path.join(current_app.root_path, "static/download/Play-0.0.1.dmg")
    return send_file(path, as_attachment=True)

@app.route('/play', methods=['GET'])
def get_play():
    return render_template('play.html')

@app.route('/daily', methods=['GET'])
def get_daily():
    suffix = "_list"
    keys = []
    for k in r.keys("*"+suffix):
        keys.append(k.decode('utf-8').replace(suffix, ""))
    keys = sorted(keys)
    return render_template('daily.html', keys=keys)

@app.route('/daily/<day>', methods=['GET'])
def get_daily_day(day):
    suffix = "_list"
    list = []
    for l in r.lrange(day+suffix, 0, -1):
        t = l.decode('utf-8').split(config.DIVISION_KEY)
        h = {"vid": t[0], "title": t[1], "duration": t[2]}
        list.append(h)
    return render_template('list.html', list=list, title=day)

@app.route('/dope', methods=['GET'])
def get_dope():
    list = []
    for l in dope_list():
        t = l.split(config.DIVISION_KEY)
        h = {"vid": t[0], "title": t[1], "duration": t[2]}
        list.append(h)
    return render_template('list.html', list=list, title="Dope")

@app.route('/fuck', methods=['GET'])
def get_fuck():
    list = []
    for l in fuck_list():
        t = l.split(config.DIVISION_KEY)
        h = {"vid": t[0], "title": t[1], "duration": t[2]}
        list.append(h)
    return render_template('list.html', list=list, title="Fuck")

@app.route('/queue', methods=['POST'])
def post_queue():
    vid = request.form["video_id"]
    title = add_queue(vid)
    return jsonify(play_list())

@app.route('/pop', methods=['POST'])
def post_pop():
    global g_vid, g_sec, g_dur
    vid = request.form["video_id"]
    item = r.lindex(config.REDIS_KEY, 0)
    if item != None and item.decode('utf-8').split(config.DIVISION_KEY)[0] == vid:
        r.lpop(config.REDIS_KEY)
        list = play_list()
        if len(list) > 0:
            t = list[0].split(config.DIVISION_KEY)
            g_vid, title, g_dur = t[0], t[1], t[2]
            g_sec = 0
            util.PostToSlack("Now playing - " + title)
    if r.llen(config.REDIS_KEY) <= 0:
        r.rpush(config.REDIS_KEY, random_video())
        list = play_list()
        t = list[0].split(config.DIVISION_KEY)
        g_vid, g_dur = t[0], t[2]
        g_sec = 0
    list = play_list()
    sse.publish({"list": list}, type='list')
    return jsonify(list)

@app.route('/now', methods=['GET'])
def get_now():
    global g_vid, g_sec, g_dur
    list = play_list()
    if len(list) <= 0:
        r.rpush(config.REDIS_KEY, random_video())
    if g_vid == "":
        list = play_list()
        t = list[0].split(config.DIVISION_KEY)
        g_vid, g_dur = t[0], t[2]
    list = play_list()
    t = list[0].split(config.DIVISION_KEY)
    vid = t[0]
    if vid != g_vid:
        g_vid = vid
    if g_sec != 0:
        diff = int(time.time() - g_sec)
    else:
        diff = g_sec
        g_sec = time.time()
    list = play_list()
    dict = {"list": list, "vid":g_vid, "sec":diff, "dur": g_dur}
    return jsonify(dict)

@app.route('/dope', methods=['POST'])
def post_dope():
    video_id = request.form["video_id"]
    list, title = add_dope(video_id)
    util.PostToSlack("Dope: " + title)
    return jsonify(list)

@app.route('/fuck', methods=['POST'])
def post_fuck():
    video_id = fuck()
    return jsonify({'fuck': video_id})

@app.route('/api/queue', methods=['POST'])
def post_api_queue():
    vid = util.GetVideoId(request.json["youtube_url"])
    title = add_queue(vid)
    if title == "":
        return jsonify(result="NG", title="")
    else:
        return jsonify(result="OK", title=title)

@app.route('/api/list', methods=['GET'])
def get_api_list():
    list = play_list()
    pl = []
    for l in list:
        t = l.split(config.DIVISION_KEY)
        vid, title = t[0], t[1]
        song = {"video_id": vid, "title": title}
        pl.append(song)
    return jsonify(pl)

@app.route('/api/dope', methods=['POST'])
def post_api_dope():
    global g_vid
    video_id = g_vid
    list, title = add_dope(video_id)
    return jsonify(result="OK", title=title)

@app.route('/api/dope/list', methods=['GET'])
def get_api_dope_list():
    list = dope_list()
    dl = []
    for l in list:
        t = l.split(config.DIVISION_KEY)
        vid, title = t[0], t[1]
        song = {"video_id": vid, "title": title}
        dl.append(song)
    return jsonify(dl)

@app.route('/api/dope/random', methods=['POST'])
def post_api_dope_random():
    count = request.json["count"]
    for i in range(int(count)):
        r.rpush(config.REDIS_KEY, random_video())
    sse.publish({"list": play_list()}, type='list')
    return jsonify(result="OK")

@app.route('/api/dope/number', methods=['POST'])
def post_api_dope_number():
    number = request.json["number"]
    list = dope_list()
    dope = list[int(number)-1]
    vid = dope.split(config.DIVISION_KEY)[0]
    title = add_queue(vid)
    return jsonify({'title': title})

@app.route('/api/fuck', methods=['POST'])
def post_api_fuck():
    video_id = fuck()
    return jsonify({'fuck': video_id})

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

def fuck_list():
    fuck_list = r.lrange(config.REDIS_FUCK_KEY, 0, -1)
    list = []
    for l in fuck_list:
        list.append(l.decode('utf-8'))
    return list

def random_list():
    random_list = r.lrange(config.REDIS_RANDOM_KEY, 0, -1)
    list = []
    for l in random_list:
        list.append(l.decode('utf-8'))
    return list

def random_video():
    list = dope_list()
    if len(list) <= 0:
        return config.DEFAULT_VALUE
    rand = random.randint(0,len(list)-1)
    rand_video = list[rand]
    t = rand_video.split(config.DIVISION_KEY)
    rand_vid = t[0]
    rand_list = random_list()
    for vid in rand_list:
        if vid == rand_vid:
            return random_video()
    r.rpush(config.REDIS_RANDOM_KEY, rand_vid)
    if len(rand_list) >= len(list) * 0.5:
        r.lpop(config.REDIS_RANDOM_KEY)
    return rand_video

def add_queue(video_id):
    items = util.GetYoutubeItems(video_id)
    for result_obj in items:
        duration = util.YTDurationToSeconds(result_obj["contentDetails"]["duration"])
        categoryId = result_obj["snippet"]["categoryId"]
        # if duration > 0 and duration < 600:
        if categoryId == "10":
            title = result_obj["snippet"]["title"]
            redis_value = video_id+config.DIVISION_KEY+title+config.DIVISION_KEY+str(duration)
            r.rpush(config.REDIS_KEY, redis_value)
            sse.publish({"list": play_list()}, type='list')
            daily_log(redis_value)
            return title
    return ""

def add_dope(video_id):
    sse.publish({}, type='dope')
    list = play_list()
    for i in list:
        t = i.split(config.DIVISION_KEY)
        vid, title, dur = t[0], t[1], t[2]
        if vid == video_id:
            for l in dope_list():
                lvid = l.split(config.DIVISION_KEY)[0]
                if lvid == video_id:
                    return list, title
            r.rpush(config.REDIS_DOPE_KEY, vid+config.DIVISION_KEY+title+config.DIVISION_KEY+dur)
            return list, title
    return list, ""

def add_fuck(video_id):
    sse.publish({}, type='fuck')
    list = play_list()
    for i in list:
        t = i.split(config.DIVISION_KEY)
        vid, title, dur = t[0], t[1], t[2]
        if vid == video_id:
            for l in fuck_list():
                lvid = l.split(config.DIVISION_KEY)[0]
                if lvid == video_id:
                    return list, title
            r.rpush(config.REDIS_FUCK_KEY, vid+config.DIVISION_KEY+title+config.DIVISION_KEY+dur)
            return list, title
    return list, ""

def fuck():
    global g_vid, g_dur, g_sec
    video_id = g_vid
    list, title = add_fuck(video_id)
    r.lpop(config.REDIS_KEY)
    list = play_list()
    if len(list) <= 0:
        r.rpush(config.REDIS_KEY, random_video())
    item = r.lindex(config.REDIS_KEY, 0)
    t = item.decode('utf-8').split(config.DIVISION_KEY)
    g_vid, current_title, g_dur = t[0], t[1], t[2]
    g_sec = 0
    util.PostToSlack("Fuck: " + title)
    util.PostToSlack("Now playing - " + current_title)
    return video_id

def daily_log(video_value):
    JST = timezone(timedelta(hours=+9), 'JST')
    jst_now = datetime.fromtimestamp(time.time(), JST)
    date_str = jst_now.strftime('%Y-%m-%d')
    r.rpush(date_str+"_list", video_value)

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers["Cache-Control"] = "public, max-age=0"
    r.headers["X-Accel-Buffering"] = "no"
    return r
