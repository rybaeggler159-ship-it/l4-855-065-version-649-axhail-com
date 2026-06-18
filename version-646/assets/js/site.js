(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");

    if (menuButton && navMenu) {
      menuButton.addEventListener("click", function () {
        navMenu.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    filterForms.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var inputs = Array.prototype.slice.call(panel.querySelectorAll("input, select"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var typeInput = panel.querySelector("[data-filter-type]");
        var regionInput = panel.querySelector("[data-filter-region]");
        var yearInput = panel.querySelector("[data-filter-year]");
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeInput && typeInput.value);
        var region = normalize(regionInput && regionInput.value);
        var year = normalize(yearInput && yearInput.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);
        });
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", applyFilter);
        input.addEventListener("change", applyFilter);
      });
    });
  });
})();

function setupMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);

  if (!video || !sourceUrl) {
    return;
  }

  var wrap = video.closest(".player-wrap");
  var overlay = wrap ? wrap.querySelector(".player-overlay") : null;
  var hlsInstance = null;
  var loaded = false;
  var waitingForHls = false;
  var shouldPlay = false;

  function requestPlay() {
    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  function load() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      waitingForHls = true;
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        waitingForHls = false;

        if (shouldPlay) {
          requestPlay();
        }
      });
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    shouldPlay = true;
    load();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (!waitingForHls) {
      requestPlay();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
