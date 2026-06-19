(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = all('[data-hero-slide]', slider);
        var dots = all('[data-hero-dot]', slider);
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var grids = all('[data-filter-grid]');
        grids.forEach(function (grid) {
            var section = grid.closest('.content-section') || document;
            var input = section.querySelector('[data-search-input]');
            var year = section.querySelector('[data-year-filter]');
            var genre = section.querySelector('[data-genre-filter]');
            var empty = section.querySelector('[data-empty-state]');
            var cards = all('[data-movie-card]', grid);
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var g = genre ? genre.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-genre')
                    ].join(' ').toLowerCase();
                    var okQuery = !q || text.indexOf(q) !== -1;
                    var okYear = !y || (card.getAttribute('data-year') || '').indexOf(y) !== -1;
                    var okGenre = !g || (card.getAttribute('data-genre') || '').indexOf(g) !== -1;
                    var ok = okQuery && okYear && okGenre;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            [input, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    window.initPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var hlsInstance = null;
        var started = false;
        function attach() {
            if (started) {
                return;
            }
            started = true;
            overlay.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    overlay.classList.remove('is-hidden');
                    started = false;
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        }
        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initSearchQuery();
    });
})();
