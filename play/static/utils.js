// Ajax
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
        alert("server error:" + errorThrown);
    })
    .always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
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

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
