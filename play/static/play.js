var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var vid;

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
                'autoplay': 0,
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

function doPlay() {
    get("/now", function (res) {
        vid = res.vid;
        sec = res.sec;
        player.loadVideoById(vid, sec);
        player.playVideo();
    });
}

function onPlayerReady(event) {
    getPlayList();
}

function onPlayerStateChange(event) {
    if (event.data == 0) {
        popPlayList();
    }
}

$(document).ready(function () {
    $('#queue').on('click', function () {
        var videoId;
        var url = $("#youtube-url").val();
        var query = url.split("?");
        var params = query.pop().split("&");
        for (var i in params) {
            var p = params[i].split("=");
            if (p[0] == "v") {
                videoId = p[1];
            }
        }
        if (videoId == '') {
            alert('Error!');
            return
        }
        post("/post", { 'video_id': videoId }, function(playList){
            $("#youtube-url").val("");
            $('#ul').empty();
            for (var prop in playList) {
                item = playList[prop];
                //vid = item.split("<fuck>")[0];
                title = item.split("<fuck>")[1];
                if (prop == 0) {
                    $('#ul').append('<li>' + title + '<img src="/static/playing.gif" class="playing-gif"></li>');
                } else {
                    $('#ul').append('<li>' + title + '</li>');
                }
            }
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
});

function getPlayList() {
    get("/list", function(playList){
        $('#ul').empty();
        for (var prop in playList) {
            item = playList[prop];
            title = item.split("<fuck>")[1];
            if (prop == 0) {
                $('#ul').append('<li>' + title + '<img src="/static/playing.gif" class="playing-gif"></li>');
            } else {
                $('#ul').append('<li>' + title + '</li>');
            }
        }
        doPlay();
    });
}

function popPlayList() {
    post("/pop", {'video_id': vid}, function(playList) {
        getPlayList();
    });
}

// Methods 
function post(path, data, cb) {
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
        alert("server error");
    })
    .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
        // console.log("call: " + path);
    });
}

