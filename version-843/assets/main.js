(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".mobile-toggle");
    var body = document.body;

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle) {
      toggle.addEventListener("click", function () {
        var opened = body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupCarousels() {
    document.querySelectorAll(".carousel-shell").forEach(function (shell) {
      var track = shell.querySelector("[data-carousel]");
      var left = shell.querySelector(".carousel-left");
      var right = shell.querySelector(".carousel-right");
      if (!track) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          track.scrollBy({ left: -360, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          track.scrollBy({ left: 360, behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    document.querySelectorAll(".js-movie-filter").forEach(function (input) {
      var scope = input.closest("section");
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", keyword !== "" && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card card-hover">',
      '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link" aria-label="' + escapeHtml(movie.title) + '">',
      '<span class="poster-frame">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-chip">▶</span>',
      '</span>',
      '<span class="movie-card-body">',
      '<span class="movie-card-title">' + escapeHtml(movie.title) + '</span>',
      '<span class="movie-card-desc">' + escapeHtml(movie.oneLine || "") + '</span>',
      '<span class="movie-card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span>',
      '<span class="tag-row">' + tags + '</span>',
      '</span>',
      '</a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.getElementById("search-form");
    var input = document.getElementById("site-search");
    var results = document.getElementById("search-results");
    if (!form || !input || !results || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var list = window.SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return keyword === "" || text.indexOf(keyword) !== -1;
      }).slice(0, 96);

      if (!list.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片，换个关键词试试。</div>';
        return;
      }
      results.innerHTML = list.map(cardTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
      window.history.replaceState(null, "", url);
      render();
    });

    input.addEventListener("input", render);
    render();
  }

  window.initPlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    setupHeader();
    setupHero();
    setupCarousels();
    setupFilters();
    setupSearchPage();
  });
})();
