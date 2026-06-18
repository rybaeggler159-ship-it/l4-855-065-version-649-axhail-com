(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var area = document.querySelector("[data-card-area]");
    if (!input || !area) {
      return;
    }
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "";
    function apply() {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
        var category = normalize(card.getAttribute("data-category"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = !activeFilter || category.indexOf(normalize(activeFilter)) !== -1 || text.indexOf(normalize(activeFilter)) !== -1;
        card.hidden = !(matchKeyword && matchFilter);
      });
    }
    input.addEventListener("input", apply);
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "";
        filters.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  }

  function setupMoviePlayer(videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var initialized = false;
    function load() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      load();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
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
        overlay.classList.add("hidden");
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
