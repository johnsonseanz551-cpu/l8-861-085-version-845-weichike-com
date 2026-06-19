function initMoviePlayer(sourceUrl, videoId, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var attached = false;

    if (!video || !overlay || !button) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function() {});
        }
    }

    button.addEventListener("click", function(event) {
        event.stopPropagation();
        play();
    });

    overlay.addEventListener("click", function() {
        play();
    });

    video.addEventListener("click", function() {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    window.addEventListener("beforeunload", function() {
        if (hls) {
            hls.destroy();
        }
    });
}
