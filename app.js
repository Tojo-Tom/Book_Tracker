let books = [];

const bookList    = document.getElementById('book-list');
const emptyState  = document.getElementById('empty-state');
const searchBox   = document.getElementById('search-box');

// Stats elements
const totalCount     = document.getElementById('total-count');
const readingCount   = document.getElementById('reading-count');
const completedCount = document.getElementById('completed-count');
const statusSummary  = document.getElementById('status-summary');

const form = document.getElementById('book-form');
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const statusSelect = document.getElementById('book-status');

const titleError = document.getElementById('title-error');
const authorError = document.getElementById('author-error');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const status = statusSelect.value;

  // Clear previous error messages
  titleError.textContent = '';
  titleError.classList.remove('has-error');
  authorError.textContent = '';
  authorError.classList.remove('has-error');

  let hasError = false;

  if (title === '') {
    titleError.textContent = 'Please enter a title';
    titleError.classList.add('has-error');
    hasError = true;
  }

  if (author === '') {
    authorError.textContent = 'Please enter an author';
    authorError.classList.add('has-error');
    hasError = true;
  }

  if (hasError) return;

  // Create the book object and push to array
  const book = {
    id: Date.now().toString(),
    title: title,
    author: author,
    status: status,
    createdAt: Date.now(),
  };

  books.push(book);

  // Clear the form and re-render
  form.reset();
  renderBooks(searchBox.value);
});

// --- Status label helpers ---
const STATUS_LABELS = {
  'want-to-read':       'Want to Read',
  'currently-reading':  'Currently Reading',
  'completed':          'Completed',
};

/**
 * Updates the stat pills and the human-readable summary sentence.
 * Always counts against the full books[] array (ignores any active search).
 */
function updateStats() {
  const completed = books.filter(b => b.status === 'completed').length;
  const reading   = books.filter(b => b.status === 'currently-reading').length;
  const wantTo    = books.filter(b => b.status === 'want-to-read').length;
  const total     = books.length;

  // Number pills in the header
  totalCount.textContent     = total;
  readingCount.textContent   = reading;
  completedCount.textContent = completed;

  // Human-readable summary sentence
  if (total === 0) {
    statusSummary.textContent = '';
  } else {
    const parts = [];
    if (completed) parts.push(completed + ' finished');
    if (reading)   parts.push(reading   + ' reading');
    if (wantTo)    parts.push(wantTo    + ' to read');
    statusSummary.textContent = parts.join(' · ');
  }
}

/**
 * Renders the book list sorted by createdAt (newest first).
 * @param {string} [rawQuery=''] - Optional search string; filters by title or author.
 * Uses textContent exclusively — no innerHTML — to prevent XSS.
 * Never mutates the books[] array.
 */
function renderBooks(rawQuery = '') {
  const query = rawQuery.trim().toLowerCase();

  // Sort a shallow copy; never mutate the source array
  let sorted = books.slice().sort((a, b) => b.createdAt - a.createdAt);

  // Filter display-only — books[] is untouched
  if (query !== '') {
    sorted = sorted.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }

  // Remove every existing book card (leave the empty-state node in place)
  const existingCards = bookList.querySelectorAll('.book-card');
  existingCards.forEach(card => card.remove());

  if (sorted.length === 0) {
    emptyState.style.display = '';
    updateStats();
    return;
  }

  emptyState.style.display = 'none';

  sorted.forEach(book => {
    // Outer card
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.id = book.id;
    card.dataset.status = book.status;

    // --- Info group (title + author) ---
    const info = document.createElement('div');
    info.className = 'book-info';

    const titleEl = document.createElement('h3');
    titleEl.className = 'book-card-title';
    titleEl.textContent = book.title;

    const authorEl = document.createElement('p');
    authorEl.className = 'book-card-author';
    authorEl.textContent = book.author;

    info.appendChild(titleEl);
    info.appendChild(authorEl);

    // --- Actions group (badge + delete button) ---
    const actions = document.createElement('div');
    actions.className = 'book-card-actions';

    // Status badge — use existing .book-badge CSS class hierarchy
    const badge = document.createElement('span');
    badge.className = 'book-badge badge-' + book.status;
    badge.textContent = STATUS_LABELS[book.status] || book.status;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-remove-book';
    deleteBtn.dataset.id = book.id;
    deleteBtn.setAttribute('aria-label', 'Delete ' + book.title);

    // Trash icon (SVG, aria-hidden)
    const trashSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    trashSvg.setAttribute('viewBox', '0 0 24 24');
    trashSvg.setAttribute('fill', 'none');
    trashSvg.setAttribute('stroke', 'currentColor');
    trashSvg.setAttribute('stroke-width', '2');
    trashSvg.setAttribute('stroke-linecap', 'round');
    trashSvg.setAttribute('stroke-linejoin', 'round');
    trashSvg.setAttribute('aria-hidden', 'true');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '3 6 5 6 21 6');
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6');
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M10 11v6');
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M14 11v6');
    const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path4.setAttribute('d', 'M9 6V4h6v2');

    trashSvg.appendChild(polyline);
    trashSvg.appendChild(path1);
    trashSvg.appendChild(path2);
    trashSvg.appendChild(path3);
    trashSvg.appendChild(path4);
    deleteBtn.appendChild(trashSvg);

    actions.appendChild(badge);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(actions);

    bookList.appendChild(card);
  });

  updateStats();
}

// --- Delete: event-delegated click on #book-list ---
bookList.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-remove-book');
  if (!btn) return;

  const id = btn.dataset.id;
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (!confirm('Remove \u201c' + book.title + '\u201d from your library?')) return;

  // Filter out by id — this is the only place books[] is mutated
  books = books.filter(b => b.id !== id);
  renderBooks(searchBox.value);
});

// --- Search: filter display on every keystroke ---
searchBox.addEventListener('input', function () {
  renderBooks(this.value);
});
