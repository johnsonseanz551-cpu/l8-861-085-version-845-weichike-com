(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
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

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var list = panel.parentElement.querySelector('.movie-grid');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute('data-filter')] = select.value.trim();
        });
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchSelects = selects.every(function (select) {
            var key = select.getAttribute('data-filter');
            var value = values[key];
            if (!value) {
              return true;
            }
            var dataValue = card.getAttribute('data-' + key) || '';
            return dataValue.indexOf(value) !== -1;
          });
          card.classList.toggle('is-hidden', !(matchQuery && matchSelects));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function setupSearchPage() {
    if (document.body.getAttribute('data-page') !== 'search') {
      return;
    }
    var form = document.querySelector('.search-page-form');
    var input = document.querySelector('.search-page-input');
    var results = document.querySelector('.search-results');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('') : '';
      return [
        '<article class="movie-card group">',
        '<a class="card-poster" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
        '<span class="card-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '</a>',
        '<div class="card-info">',
        '<h2 class="card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p class="card-desc">' + escapeHtml(movie.desc || '') + '</p>',
        '<div class="hero-tags mini">' + tags + '</div>',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render(query) {
      if (!results || !window.SEARCH_MOVIES) {
        return;
      }
      var text = String(query || '').trim().toLowerCase();
      var movies = window.SEARCH_MOVIES.filter(function (movie) {
        if (!text) {
          return true;
        }
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.desc,
          Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
        ].join(' ').toLowerCase();
        return haystack.indexOf(text) !== -1;
      }).slice(0, 120);
      if (!movies.length) {
        results.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
        return;
      }
      results.innerHTML = movies.map(card).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        render(value);
      });
    }
    render(initial);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.play-cover');
      var src = player.getAttribute('data-video');
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!video || !src) {
          return;
        }
        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
          } else {
            video.src = src;
          }
          started = true;
        }
        player.classList.add('is-playing');
        if (cover) {
          cover.setAttribute('hidden', 'hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            start();
          }
        });
        video.addEventListener('ended', function () {
          if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
            hlsInstance = null;
            started = false;
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
