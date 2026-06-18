(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(nextSlide, 5000);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHeroTimer();
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(currentSlide - 1);
        startHeroTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentSlide + 1);
        startHeroTimer();
      });
    }

    startHeroTimer();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupCardSearch() {
    var searchInput = document.querySelector('[data-card-search]');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var scope = document.querySelector('[data-search-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (!searchInput && !filterSelects.length) {
      return;
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].map(normalize).join(' ');

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilters = filterSelects.every(function (select) {
          var key = select.getAttribute('data-card-filter');
          var selected = normalize(select.value);
          var actual = normalize(card.getAttribute('data-' + key));
          return !selected || actual === selected;
        });
        var visible = matchesQuery && matchesFilters;

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }

  setupCardSearch();
})();
