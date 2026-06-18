(function () {
  var input = document.querySelector('[data-global-search]');
  var category = document.querySelector('[data-global-category]');
  var results = document.querySelector('[data-global-results]');
  var empty = document.querySelector('[data-global-empty]');
  var movies = window.MOVIE_SEARCH_DATA || [];

  if (!input || !results) {
    return;
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '" data-title="' + escapeHtml(movie.title) + '">',
      '  <div class="movie-poster">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-badge">▶</span>',
      '    <span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
      '  </div>',
      '  <div class="movie-info">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render() {
    var query = normalize(input.value);
    var selectedCategory = normalize(category ? category.value : '');
    var filtered = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' '));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesCategory = !selectedCategory || normalize(movie.category) === selectedCategory;
      return matchesQuery && matchesCategory;
    }).slice(0, 120);

    results.innerHTML = filtered.map(createCard).join('\n');

    if (empty) {
      empty.hidden = filtered.length !== 0;
    }
  }

  input.addEventListener('input', render);

  if (category) {
    category.addEventListener('change', render);
  }

  render();
})();
