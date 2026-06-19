(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function toggleHeader() {
        var header = document.querySelector(".site-header");
        if (!header || header.classList.contains("solid-header")) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-section");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var copies = Array.prototype.slice.call(hero.querySelectorAll(".hero-copy"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            copies.forEach(function (copy, i) {
                copy.hidden = i !== index;
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        hero.querySelectorAll("[data-hero]").forEach(function (button) {
            button.addEventListener("click", function () {
                var direction = button.getAttribute("data-hero");
                show(direction === "next" ? index + 1 : index - 1);
                start();
            });
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupRows() {
        document.querySelectorAll("[data-scroll-row]").forEach(function (wrap) {
            var row = wrap.querySelector(".horizontal-row");
            if (!row) {
                return;
            }
            wrap.querySelectorAll("[data-scroll]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var amount = button.getAttribute("data-scroll") === "left" ? -420 : 420;
                    row.scrollBy({ left: amount, behavior: "smooth" });
                });
            });
        });
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupSiteSearch() {
        var input = document.querySelector("[data-site-search]");
        var results = document.querySelector("[data-site-results]");
        if (!input || !results || !window.SEARCH_DATA) {
            return;
        }
        input.addEventListener("input", function () {
            var query = normalize(input.value);
            if (!query) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }
            var matches = window.SEARCH_DATA.filter(function (item) {
                return normalize(item.title + " " + item.region + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
            }).slice(0, 12);
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"><span><strong>' + item.title + '</strong><br><small>' + item.region + ' · ' + item.year + ' · ' + item.genre + '</small></span></a>';
            }).join("");
            results.classList.toggle("is-open", matches.length > 0);
        });
    }

    function setupFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var keywordInput = document.querySelector("[data-filter-keyword]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var visible = (!keyword || text.indexOf(keyword) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
                card.classList.toggle("is-hidden-card", !visible);
            });
        }

        [keywordInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll(".video-player").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var button = player.querySelector(".player-start");
            var message = player.querySelector(".player-message");
            if (!video || !overlay || !button) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var loaded = false;
            var hls = null;

            function showMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.classList.add("is-visible");
                }
            }

            function load() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    return new Promise(function (resolve, reject) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                reject(new Error("playback"));
                            }
                        });
                    });
                }
                return Promise.reject(new Error("playback"));
            }

            function begin() {
                overlay.classList.add("is-hidden");
                load().then(function () {
                    return video.play();
                }).catch(function () {
                    overlay.classList.remove("is-hidden");
                    showMessage("视频暂时无法播放");
                });
            }

            button.addEventListener("click", begin);
            overlay.addEventListener("click", begin);
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        toggleHeader();
        window.addEventListener("scroll", toggleHeader, { passive: true });
        setupMenu();
        setupHero();
        setupRows();
        setupSiteSearch();
        setupFilters();
        setupPlayers();
    });
})();
