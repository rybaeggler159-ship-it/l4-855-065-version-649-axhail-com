(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  $all('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
    }, { once: true });
  });

  var toggle = $('[data-menu-toggle]');
  var mobileMenu = $('[data-mobile-menu]');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  $all('[data-hero]').forEach(function (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  });

  $all('[data-filter-select]').forEach(function (select) {
    select.addEventListener('change', function () {
      var root = select.closest('[data-filter-root]');
      if (!root) {
        return;
      }
      var cards = $all('[data-movie-card]', root);
      var typeValue = ($('[data-filter-type]', root) || {}).value || 'all';
      var yearValue = ($('[data-filter-year]', root) || {}).value || 'all';
      cards.forEach(function (card) {
        var typeOk = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
        var yearOk = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
        card.style.display = typeOk && yearOk ? '' : 'none';
      });
    });
  });

  var searchRoot = $('[data-search-root]');
  if (searchRoot) {
    var input = $('[data-search-input]', searchRoot);
    var cards = $all('[data-movie-card]', searchRoot);
    var empty = $('[data-no-result]', searchRoot);
    var form = $('[data-search-form]', searchRoot);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function applySearch(value) {
      var query = (value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        applySearch(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch(input ? input.value : '');
      });
    }

    applySearch(initial);
  }

  $all('[data-player]').forEach(function (player) {
    var video = $('video', player);
    var cover = $('[data-play]', player);
    var src = player.getAttribute('data-m3u8');
    var loaded = false;

    function attachSource() {
      if (!video || !src || loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      attachSource();
      player.classList.add('is-playing');
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  });
})();
