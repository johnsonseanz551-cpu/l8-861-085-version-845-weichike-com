(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var input = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-filter-list]');
    var count = document.querySelector('[data-filter-count]');

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      input.value = query;
    }

    if (input.hasAttribute('data-autofocus-search')) {
      input.focus();
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      list.classList.toggle('is-empty', visible === 0);

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('video[data-src]');
      var button = shell.querySelector('[data-play-button]');

      if (!video || !button) {
        return;
      }

      function attachAndPlay() {
        var source = video.getAttribute('data-src');

        button.classList.add('is-hidden');

        if (!video.dataset.ready) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }

          video.dataset.ready = 'true';
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', attachAndPlay);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
}());
