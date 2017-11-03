var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var vid;
var timeoutID;

function onYouTubeIframeAPIReady() {
    createPlayer();
}

function createPlayer() {
    w = $(window).width() * 0.6;
    h = w * 9/16;
    player = new YT.Player(
        'player',
        {
            width: w,
            height: h,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'rel': 0,
                'showinfo': 0,
                'start': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        }
    );
}

function timeCountdown() {
    time = $("#time").val();
    time = time - 1
    if (time <= 0) {
        time = 0;
    }
    $("#time").val(time);
    $("#time").text(time.toString().toMMSS());
    timeoutID = setTimeout('timeCountdown()', 1000);
}

function doPlay() {
    get("/now", function (res) {
        list = res.list;
        renderPlayList(list);
        vid = res.vid;
        sec = res.sec;
        dur = res.dur;
        time = dur - sec;
        $("#time").val(time);
        clearTimeout(timeoutID);
        timeCountdown();
        player.loadVideoById(vid, sec);
        player.playVideo();
    });
}

function onPlayerReady(event) {
    doPlay();
}

function onPlayerStateChange(event) {
    if (event.data == 0) {
        popPlayList();
    }
}

function getVideoIDfromURL(url) {
    var query = url.split("?");
    if (url.match(/^https:\/\/youtu.be/)) {
      /*
       * https://youtu.be/foobar?another=parameters
       * Extract videoId: ^^^^^^ from URL.
       */
      return query[0].replace(/\/$/, "").split("/").pop();
    } else {
      var params = query.pop().split("&");
      for (var i in params) {
          var p = params[i].split("=");
          if (p[0] == "v") {
              return p[1];
          }
      }
    }
    return '';
}

$(document).ready(function () {
    $("#loading").hide();
    $('#queue').on('click', function () {
        var videoId = getVideoIDfromURL($("#youtube-url").val());
        if (videoId == '') {
            alert('Error!');
            return
        }
        post("/post", { 'video_id': videoId }, function(playList){
            $("#youtube-url").val("");
            renderPlayList(playList);
        });
    });
    $('#mute').on('click', function() {
        var mute = $('#mute:checked').val();
        if (mute == 'on') {
            player.setVolume(0);
        } else {
            player.setVolume(100);
        }
    });
    
    stream();
});

function stream() {
    var source = new EventSource("/stream");
    source.addEventListener('list', function(event) {
        var json = JSON.parse(event.data);
        renderPlayList(json.list);
    }, false);

    source.addEventListener('dope', function(event) {
        var audio = new Audio('/static/dope.mp3');
        audio.play();
    }, false);

    source.addEventListener('fuck', function(event) {
        var audio = new Audio('/static/fuck.mp3');
        audio.play();
    }, false);
}

function popPlayList() {
    post("/pop", {'video_id': vid}, function(playList) {
        doPlay();
    });
}

function dope(vid) {
    post("/dope", {'video_id': vid}, function(playList) {
        setItem(vid, true);
        renderPlayList(playList);
    });
}

function renderPlayList(playList) {
    $('#ul').empty();
    for (var prop in playList) {
        item = playList[prop];
        t = item.split("<fuck>");
        video_id = t[0];
        title = t[1];
        duration = t[2];
        disabled = "";
        dopeStatus = "dope";
        if (getItem(video_id)) {
            disabled = "disabled";
            dopeStatus = "dope";
        }
        if (prop == 0) {
            $('#ul').append('<li><a class="button btn-dope ' + disabled + '" onClick="dope(\'' + video_id + '\')" >' +dopeStatus+'</a>' + title + ' - ' + duration.toMMSS() + '<img src="/static/playing.gif" class="playing-gif"></li>');
        } else {
            $('#ul').append('<li><a class="button btn-dope ' + disabled + '"  onClick="dope(\'' + video_id + '\')">' +dopeStatus+'</a>' + title + ' - ' + duration.toMMSS() + '</li>');
        }
    }
}


// Methods 
function post(path, data, cb) {
    $("#loading").show();
    $.ajax({
        type: "POST",
        url: path,
        timeout: 10000,
        cache: false,
        data: data,
        dataType: 'json'
    })
    .done(function (response, textStatus, jqXHR) {
        if (response.status === "err") {
            alert("err: " + response.msg);
        } else {
            playList = response;
            cb(playList);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        alert("server error");
    })
    .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
        // console.log("call: " + path);
        $("#loading").hide();
    });
}

function get(path, cb) {
    $.ajax({
        type: "GET",
        url: path,
        timeout: 10000,
        cache: false,
        data: {},
        dataType: 'json'
    })
    .done(function (response, textStatus, jqXHR) {
        if (response.status === "err") {
            alert("err: " + response.msg);
        } else {
            playList = response;
            cb(playList);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        alert("server error: "+ errorThrown);
    })
    .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
        // console.log("call: " + path);
    });
}

function setItem(key, val) {
    window.localStorage.setItem(key, val);
}
function getItem(key) {
    return window.localStorage.getItem(key);
}
function removeItem(key) {
    window.localStorage.removeItem(key);
}
function clear() {
    window.localStorage.clear();
}

String.prototype.toMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}
