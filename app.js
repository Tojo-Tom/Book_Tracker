let books = [];

const bookList = document.getElementById('book-list');
const emptyState = document.getElementById('empty-state');

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
  renderBooks();
});

// --- Status label helpers ---
const STATUS_LABELS = {
  'want-to-read':       'Want to Read',
  'currently-reading':  'Currently Reading',
  'completed':          'Completed',
};

/**
 * Renders the full book list sorted by createdAt (newest first).
 * Uses textContent exclusively — no innerHTML — to prevent XSS.
 */
function renderBooks() {
  // Sort a shallow copy; never mutate the source array
  const sorted = books.slice().sort((a, b) => b.createdAt - a.createdAt);

  // Remove every existing book card (leave the empty-state node in place)
  const existingCards = bookList.querySelectorAll('.book-card');
  existingCards.forEach(card => card.remove());

  if (sorted.length === 0) {
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';

  sorted.forEach(book => {
    // Outer card
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.id = book.id;
    card.dataset.status = book.status;

    // Title
    const titleEl = document.createElement('h3');
    titleEl.className = 'book-card-title';
    titleEl.textContent = book.title;

    // Author
    const authorEl = document.createElement('p');
    authorEl.className = 'book-card-author';
    authorEl.textContent = book.author;

    // Status badge
    const badge = document.createElement('span');
    badge.className = 'book-status-badge status-' + book.status;
    badge.textContent = STATUS_LABELS[book.status] || book.status;

    card.appendChild(titleEl);
    card.appendChild(authorEl);
    card.appendChild(badge);

    bookList.appendChild(card);
  });
}
