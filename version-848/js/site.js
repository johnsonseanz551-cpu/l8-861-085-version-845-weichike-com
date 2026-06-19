(function () {
  const headerButton = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (headerButton && mobileNav) {
    headerButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('is-open');
      headerButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const libraryTools = document.querySelector('[data-library-tools]');
  const libraryGrid = document.querySelector('[data-library-grid]');
  if (libraryTools && libraryGrid) {
    const cards = Array.from(libraryGrid.querySelectorAll('.library-card'));
    const searchInput = libraryTools.querySelector('[data-filter-search]');
    const genreSelect = libraryTools.querySelector('[data-filter-genre]');
    const regionSelect = libraryTools.querySelector('[data-filter-region]');
    const typeSelect = libraryTools.querySelector('[data-filter-type]');
    const yearSelect = libraryTools.querySelector('[data-filter-year]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(searchInput && searchInput.value);
      const genre = normalize(genreSelect && genreSelect.value);
      const region = normalize(regionSelect && regionSelect.value);
      const type = normalize(typeSelect && typeSelect.value);
      const year = normalize(yearSelect && yearSelect.value);

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));

        const matched =
          (!query || haystack.includes(query)) &&
          (!genre || normalize(card.dataset.genre).includes(genre)) &&
          (!region || normalize(card.dataset.region) === region) &&
          (!type || normalize(card.dataset.type) === type) &&
          (!year || normalize(card.dataset.year) === year);

        card.classList.toggle('is-hidden', !matched);
      });
    }

    [searchInput, genreSelect, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
  let hlsLoadPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve();
    }
    if (hlsLoadPromise) {
      return hlsLoadPromise;
    }
    hlsLoadPromise = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoadPromise;
  }

  function attachStream(video) {
    const source = video && video.dataset ? video.dataset.src : '';
    if (!video || !source) {
      return Promise.reject(new Error('empty video'));
    }
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }
    video.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    return loadHlsScript().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }).catch(function () {
      video.src = source;
    });
  }

  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-trigger');

    function playVideo() {
      attachStream(video).then(function () {
        shell.classList.add('is-playing');
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
})();
