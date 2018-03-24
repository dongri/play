function stream() {
    var source = new EventSource("/stream");
    source.addEventListener('list', sseListEvent, false);
    source.addEventListener('user', sseUserEvent, false);
    source.addEventListener('dope', sseDopeEvent,false);
    source.addEventListener('fuck', sseFuckEvent,false);
    source.addEventListener('error', sseError, false);
    window.addEventListener('beforeunload', sseClose, false);
}
function sseListEvent(e) {
    var json = JSON.parse(e.data);
    renderPlayList(json.list);
}
function sseUserEvent(e) {
    var json = JSON.parse(e.data);
    renderPlayUser(json.user);
}
function sseDopeEvent(e) {
    var audio = new Audio('/static/dope.mp3');
    audio.play();
}
function sseFuckEvent(e) {
    var audio = new Audio('/static/fuck.mp3');
    audio.play();
    doPlay();
}
function sseError(e) {
    source = e.currentTarget;
    if (source.readyState === EventSource.CONNECTING) { // === 0
        console.log('reconnet');
    } else if (source.readyState === EventSource.CLOSED) { // === 2
        console.log('close');
        source.close();
        sseReconnect(source);
    }
}
function sseClose(e) {
    source = e.currentTarget;
    source.close();
}
function sseReconnect(source) {
    source.removeEventListener('list', sseListEvent, false);
    source.removeEventListener('user', sseUserEvent, false);
    source.removeEventListener('dope', sseDopeEvent, false);
    source.removeEventListener('fuck', sseFuckEvent, false);
    source.removeEventListener('error', sseError, false);
    window.removeEventListener('beforeunload', sseClose, false);
    source = null;
    stream();
}
