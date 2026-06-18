/* Static movie site interactions. */

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var result = document.querySelector("[data-filter-result]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function getCards() {
      return lists.reduce(function (all, list) {
        return all.concat(Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]")));
      }, []);
    }

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].map(normalizeText).join(" ");
    }

    function applyFilter() {
      var keyword = normalizeText(input ? input.value : "");
      var type = normalizeText(typeSelect ? typeSelect.value : "");
      var visible = 0;
      getCards().forEach(function (card) {
        var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var cardType = normalizeText(card.getAttribute("data-type"));
        var matchesType = !type || cardType.indexOf(type) !== -1;
        var show = matchesKeyword && matchesType;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : "default";
      if (mode === "default") {
        applyFilter();
        return;
      }
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
        cards.sort(function (a, b) {
          if (mode === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (mode === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          return 0;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }
    applySort();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var start = player.querySelector("[data-player-start]");
      var errorBox = player.querySelector("[data-player-error]");
      var source = player.getAttribute("data-src");
      var loaded = false;
      var hlsInstance = null;

      function showError(message) {
        if (errorBox) {
          errorBox.textContent = message;
          errorBox.classList.add("is-visible");
        }
      }

      function markReady() {
        player.classList.add("is-ready");
      }

      function loadSource() {
        if (!video || loaded) {
          return;
        }
        if (!source) {
          showError("没有可用播放源");
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, markReady);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showError("网络错误，正在尝试重新连接播放源");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showError("媒体错误，正在尝试恢复播放");
              hlsInstance.recoverMediaError();
            } else {
              showError("无法播放该视频源");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", markReady, { once: true });
        } else {
          showError("当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器访问");
        }
      }

      function playVideo() {
        loadSource();
        if (!video) {
          return;
        }
        video.controls = true;
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showError("浏览器阻止了自动播放，请再次点击播放器开始播放");
            player.classList.remove("is-playing");
          });
        }
      }

      if (start) {
        start.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
