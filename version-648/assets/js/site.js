(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let heroIndex = 0;
  let heroTimer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === heroIndex);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(() => {
      setHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      setHero(index);
      startHero();
    });
  });

  setHero(0);
  startHero();

  const searchInput = document.querySelector("[data-search-input]");
  const typeSelect = document.querySelector("[data-filter-type]");
  const yearSelect = document.querySelector("[data-filter-year]");
  const cards = Array.from(document.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards() {
    const keyword = normalize(searchInput ? searchInput.value : "");
    const type = normalize(typeSelect ? typeSelect.value : "");
    const year = normalize(yearSelect ? yearSelect.value : "");

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(" "));
      const okKeyword = !keyword || haystack.includes(keyword);
      const okType = !type || normalize(card.dataset.type).includes(type);
      const okYear = !year || normalize(card.dataset.year) === year;
      card.classList.toggle("is-hidden", !(okKeyword && okType && okYear));
    });
  }

  [searchInput, typeSelect, yearSelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });

  const video = document.querySelector(".js-player");
  const playButton = document.querySelector(".js-play-button");
  const overlay = document.querySelector(".player-overlay");
  let hlsInstance = null;

  function streamUrl() {
    if (!video) {
      return "";
    }
    const source = video.querySelector("source");
    return source ? source.src : "";
  }

  function attachPlayer() {
    if (!video) {
      return;
    }
    const url = streamUrl();
    if (!url) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = url;
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      }
    } else if (!video.src) {
      video.src = url;
    }
    video.controls = true;
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(() => {});
    }
  }

  if (playButton) {
    playButton.addEventListener("click", attachPlayer);
  }

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        attachPlayer();
      }
    });
  }

  if (video) {
    video.addEventListener("click", () => {
      if (video.paused) {
        attachPlayer();
      }
    });
  }
})();
