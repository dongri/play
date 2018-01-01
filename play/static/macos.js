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
        if (prop == 0) {
            $('#ul').append('<li class="list-item"><a class="dope" onClick="dope(\'' + video_id + '\')" >Dope</a><div class="video_title">' + title + '</div><img src="/static/playing.gif" class="playing-gif" id="playing-gif"></li>');
        } else {
            $('#ul').append('<li class="list-item"><a class="dope"  onClick="dope(\'' + video_id + '\')">Dope</a><div class="video_title">' + title + '</div></li>');
        }
    }

    $(".video_title").width(
        Math.floor($(window).width() - $('.btn-dope').width() - 60)
    );
}

$(document).ready(function () {
    $("#loading").hide();

    $('#play-start-end').on('click', function () {
        if (this.src.indexOf('on.png') > -1) {
            this.src = "/static/off.png";
            //player.setVolume(100);
            doPlay();
            $("#playing-gif").show();
        } else {
            this.src = "/static/on.png";
            //player.setVolume(0);
            doStop();
            $("#playing-gif").hide();
        }
    });

    $('#playlist').height(
        $(window).height() - $('#title').height() - $('#play-button').height() - $('#control').height() - $('#quit').height() - 36
    );

    stream();
})

function dope(vid) {
    post("/dope", { 'video_id': vid }, function (playList) {
        //renderPlayList(playList);
    });
}
