(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("open");
      });
    }

    document.querySelectorAll(".hero").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
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
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

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

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.querySelector(button.getAttribute("data-scroll-target"));
        var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;
        if (target) {
          target.scrollBy({ left: direction * 360, behavior: "smooth" });
        }
      });
    });

    var searchInput = document.querySelector("[data-search-input]");
    var regionSelect = document.querySelector("[data-region-select]");
    var typeSelect = document.querySelector("[data-type-select]");
    var yearSelect = document.querySelector("[data-year-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle("is-filtered-out", !matched);
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    document.querySelectorAll("[data-inline-filter]").forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        document.querySelectorAll(".movie-card[data-search]").forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.querySelector(".player-video");
  var cover = document.querySelector(".player-cover");
  var button = document.querySelector(".player-button");
  var hlsInstance = null;
  var ready = false;

  if (!video || !sourceUrl) {
    return;
  }

  function attemptPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function attachSource() {
    if (ready) {
      attemptPlay();
      return;
    }

    ready = true;

    if (cover) {
      cover.classList.add("is-hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      attemptPlay();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        attemptPlay();
      });
      attemptPlay();
      return;
    }

    video.src = sourceUrl;
    attemptPlay();
  }

  if (button) {
    button.addEventListener("click", attachSource);
  }

  if (cover) {
    cover.addEventListener("click", attachSource);
  }

  video.addEventListener("click", function () {
    if (!ready) {
      attachSource();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
