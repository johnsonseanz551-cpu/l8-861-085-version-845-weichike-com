(function() {
    function closest(target, selector) {
        while (target && target !== document) {
            if (target.matches && target.matches(selector)) {
                return target;
            }
            target = target.parentNode;
        }
        return null;
    }

    document.addEventListener("click", function(event) {
        var button = closest(event.target, "[data-menu-button]");
        if (button) {
            var menu = document.querySelector("[data-mobile-menu]");
            if (menu) {
                menu.classList.toggle("hidden");
            }
        }
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
            if (!isNaN(index)) {
                showSlide(index);
            }
        });
    });

    if (slides.length > 1) {
        setInterval(function() {
            showSlide(active + 1);
        }, 5200);
    }

    var filter = document.querySelector("[data-page-filter]");
    if (filter) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        filter.addEventListener("input", function() {
            var query = filter.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("hidden", visible !== 0);
            }
        });
    }
})();
