(function () {
  const ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  };

  ready(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        const isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
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

    function startCarousel() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startCarousel();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startCarousel();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startCarousel();
        });
      }

      startCarousel();
    }

    const searchInput = document.querySelector(".movie-search");
    const clearSearch = document.querySelector(".clear-search");
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const noResults = document.querySelector(".no-results");
    let activeFilter = "";

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        const show = matchQuery && matchFilter;
        card.classList.toggle("hidden-by-filter", !show);
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("show", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (clearSearch) {
      clearSearch.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        activeFilter = "";
        filterButtons.forEach(function (button) {
          button.classList.toggle("active", button.getAttribute("data-filter-value") === "");
        });
        applyFilters();
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "";
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });

    const player = document.querySelector(".player-shell");

    if (player) {
      const video = player.querySelector("video");
      const button = player.querySelector(".play-overlay");
      const status = document.querySelector(".player-status");
      const stream = player.getAttribute("data-stream");
      let prepared = false;
      let hls = null;

      function setStatus(value) {
        if (status) {
          status.textContent = value || "";
        }
      }

      function prepareVideo() {
        if (!video || !stream || prepared) {
          return;
        }

        prepared = true;
        setStatus("正在加载视频");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("视频已就绪");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放暂时不可用，请稍后再试");
              if (hls) {
                hls.destroy();
                hls = null;
              }
              prepared = false;
            }
          });
        } else {
          video.src = stream;
        }
      }

      function startVideo() {
        prepareVideo();
        if (!video) {
          return;
        }
        const result = video.play();
        player.classList.add("is-playing");
        if (result && typeof result.then === "function") {
          result.then(function () {
            setStatus("正在播放");
          }).catch(function () {
            player.classList.remove("is-playing");
            setStatus("点击播放器开始观看");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startVideo();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("loadedmetadata", function () {
          setStatus("视频已就绪");
        });
      }
    }
  });
})();
