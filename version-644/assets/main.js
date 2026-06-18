(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function setSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          var active = slideIndex === current;
          slide.classList.toggle('active', active);
          slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          setSlide(current + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          setSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          setSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          startTimer();
        });
      });

      setSlide(0);
      startTimer();
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
      var input = filterRoot.querySelector('[data-filter-input]');
      var category = filterRoot.querySelector('[data-filter-category]');
      var year = filterRoot.querySelector('[data-filter-year]');
      var region = filterRoot.querySelector('[data-filter-region]');
      var empty = filterRoot.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilters() {
        var q = normalize(input ? input.value : '');
        var selectedCategory = normalize(category ? category.value : '');
        var selectedYear = normalize(year ? year.value : '');
        var selectedRegion = normalize(region ? region.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-type')
          ].join(' '));
          var matchQuery = !q || haystack.indexOf(q) !== -1;
          var matchCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
          var show = matchQuery && matchCategory && matchYear && matchRegion;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, category, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    }
  });
}());
