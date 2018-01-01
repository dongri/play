function queue(vid, THIS) {
    post("/queue", { 'video_id': vid }, function(playList){
        $(THIS).text("DONE");
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
        alert("server error: "+ errorThrown);
    })
    .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
        // console.log("call: " + path);
    });
}
