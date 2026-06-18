(function () {
    var $ = function (selector, root) {
        return (root || document).querySelector(selector);
    };

    var $$ = function (selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    };

    var menuButton = $('[data-menu-toggle]');
    var mobilePanel = $('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    $$('.header-search, .mobile-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = $('input[name="q"]', form);
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            }
        });
    });

    var hero = $('[data-hero]');
    if (hero) {
        var slides = $$('[data-slide]', hero);
        var dots = $$('[data-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        var play = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-dot')) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        play();
    }

    var runFilter = function (root) {
        var container = $('[data-card-container]', root || document);
        if (!container) {
            return;
        }

        var input = $('[data-global-input]', root || document) || $('[data-local-input]', root || document);
        var region = $('[data-region-select]', root || document);
        var year = $('[data-year-select]', root || document);
        var empty = $('[data-empty-state]', root || document);
        var cards = $$('.movie-card, .movie-row', container);
        var params = new URLSearchParams(window.location.search);

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        if (year && params.get('year')) {
            year.value = params.get('year');
        }

        var apply = function () {
            var q = input ? input.value.trim().toLowerCase() : '';
            var r = region ? region.value : '';
            var y = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!q || text.indexOf(q) !== -1) && (!r || cardRegion === r) && (!y || cardYear === y);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    };

    runFilter(document);

    $$('.movie-player').forEach(function (player) {
        var video = $('video', player);
        var button = $('.play-overlay', player);
        var stream = player.getAttribute('data-video') || '';
        var started = false;
        var engine = null;

        var start = function () {
            if (!video || !stream) {
                return;
            }

            if (!started) {
                started = true;
                player.classList.add('is-playing');

                if (button) {
                    button.hidden = true;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    engine = new window.Hls();
                    engine.loadSource(stream);
                    engine.attachMedia(video);
                    engine.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            } else if (video.paused) {
                video.play().catch(function () {});
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    start();
                }
            });

            video.addEventListener('ended', function () {
                if (engine) {
                    engine.stopLoad();
                }
            });
        }
    });
})();
