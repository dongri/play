/* 
 YouTube Audio Embed 
 --------------------
 
 Author: Amit Agarwal
 Web: http://www.labnol.org/?p=26740 
*/

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
    player = new YT.Player(
        'youtube-audio',
        {
            width: "0",
            height: "0",
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'start': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        }
    );
}

function onPlayerReady(event) {
    get("/now", function (res) {
        list = res.list;
        renderPlayList(list);
        $("#playing-gif").hide();
    });
}

function onPlayerStateChange(event) {
    if (event.data == 0) {
        popPlayList();
    }
}

function doPlay() {
    get("/now", function (res) {
        list = res.list;
        renderPlayList(list);
        vid = res.vid;
        sec = res.sec;
        dur = res.dur;
        // time = dur - sec;
        // $("#time").val(time);
        // clearTimeout(timeoutID);
        // timeCountdown();
        // alert(vid);
        player.loadVideoById(vid, sec);
        player.playVideo();
        b = $('#play-start-end');
        if (b.attr('src').indexOf('on.png') > -1) {
            player.setVolume(0);
            $("#playing-gif").hide();
        } else {
            player.setVolume(100);
            $("#playing-gif").show();
        }
    });
}

function doStop() {
    player.stopVideo();
}

function popPlayList() {
    post("/pop", { 'video_id': vid }, function (playList) {
        doPlay();
        $("#playing-gif").show();
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
        if (prop == 0) {
            $('#ul').append('<li class="list-item"><a class="button btn-dope ' + disabled + '" onClick="dope(\'' + video_id + '\')" >dope</a><div class="video_title">' + title + '</div><img src="/static/playing.gif" class="playing-gif" id="playing-gif"></li>');
        } else {
            $('#ul').append('<li class="list-item"><a class="button btn-dope ' + disabled + '"  onClick="dope(\'' + video_id + '\')">dope</a><div class="video_title">' + title + '</div></li>');
        }
    }

    $(".video_title").width(
        Math.floor($(window).width() - $('.btn-dope').width() - 60)
    );

}

function dope(vid) {
    post("/dope", { 'video_id': vid }, function (playList) {
        //renderPlayList(playList);
    });
}


$(document).ready(function () {
    $("#loading").hide();

    $('#queue').on('click', function () {
        var videoId = getVideoIDfromURL($("#youtube-url").val());
        if (videoId == '') {
            alert('Error!');
            return
        }
        post("/post", { 'video_id': videoId }, function (playList) {
            $("#youtube-url").val("");
            renderPlayList(playList);
        });
    });

    $('#play-start-end').on('click', function () {
        if (this.src.indexOf('on.png') > -1) {
            this.src = "/static/electron/off.png";
            //player.setVolume(100);
            doPlay();
            $("#playing-gif").show();
        } else {
            this.src = "/static/electron/on.png";
            //player.setVolume(0);
            doStop();
            $("#playing-gif").hide();
        }
    });

    $('#playlist').height(
        $(window).height() - $('#title').height() - $('#play-button').height() - $('#control').height() - $('#quit').height() - 36
    );

})

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
    $("#loading").show();
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
            $("#loading").hide();
        });
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
