(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('#mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('#heroCarousel');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 6500);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter-input'));

  filterInputs.forEach(function (input) {
    var scope = document.querySelector('.filter-scope');
    if (!scope) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      Array.prototype.slice.call(scope.querySelectorAll('.movie-card')).forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var searchInput = document.querySelector('#siteSearchInput');
  var searchGrid = document.querySelector('#searchMovieGrid');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var activeCategory = 'all';

  function applySearch() {
    if (!searchGrid) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card')).forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var category = card.getAttribute('data-category');
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchCategory = activeCategory === 'all' || activeCategory === category;
      card.classList.toggle('is-hidden', !(matchKeyword && matchCategory));
    });
  }

  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }

    searchInput.addEventListener('input', applySearch);
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applySearch();
      });
    });
    applySearch();
  }

  var playButton = document.querySelector('#playButton');
  var video = document.querySelector('#moviePlayer');

  if (playButton && video) {
    var hlsInstance = null;

    function startVideo() {
      var videoUrl = playButton.getAttribute('data-video-src');
      if (!videoUrl) {
        return;
      }

      playButton.classList.add('hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== videoUrl) {
          video.src = videoUrl;
        }
        video.play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.play();
        }
        return;
      }

      if (video.src !== videoUrl) {
        video.src = videoUrl;
      }
      video.play();
    }

    playButton.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (!video.src) {
        startVideo();
      }
    });
  }
})();
