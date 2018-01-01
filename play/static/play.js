var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var vid;
var timeoutID;

function onYouTubeIframeAPIReady() {
    createPlayer();
    $(".contents").show();
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
    $("#time").text(time.toString().toHHMMSS());
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
        post("/queue", { 'video_id': videoId }, function(playList){
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


function popPlayList() {
    post("/pop", {'video_id': vid}, function(playList) {
        doPlay();
    });
}

function dope(vid) {
    post("/dope", {'video_id': vid}, function(playList) {
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
        if (prop == 0) {
            $('#ul').append('<li><a class="dope" onClick="dope(\'' + video_id + '\')" >Dope</a>' + title + ' - ' + duration.toHHMMSS() + '<img src="/static/playing.gif" class="playing-gif"></li>');
        } else {
            $('#ul').append('<li><a class="dope"  onClick="dope(\'' + video_id + '\')">Dope</a>' + title + ' - ' + duration.toHHMMSS() + '</li>');
        }
    }
    $("#playinput").show();
}
