// app.js - handles the page (DOM). The rules live in logic.js,
// which must be loaded first: <script src="logic.js"></script>

let books = loadBooks();

const bookList = document.getElementById('book-list');
const emptyState = document.getElementById('empty-state');
const searchBox = document.getElementById('search-box');

// Stats elements
const totalCount = document.getElementById('total-count');
const readingCount = document.getElementById('reading-count');
const completedCount = document.getElementById('completed-count');
const statusSummary = document.getElementById('status-summary');

const form = document.getElementById('book-form');
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const statusSelect = document.getElementById('book-status');

const titleError = document.getElementById('title-error');
const authorError = document.getElementById('author-error');

// --- Add a book ---
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const errors = validateBook(titleInput.value, authorInput.value);

    titleError.textContent = errors.title || '';
    titleError.classList.toggle('has-error', Boolean(errors.title));
    authorError.textContent = errors.author || '';
    authorError.classList.toggle('has-error', Boolean(errors.author));

    if (Object.keys(errors).length > 0) return;

    books.push(createBook(titleInput.value, authorInput.value, statusSelect.value));
    saveBooks(books);

    form.reset();
    renderBooks(searchBox.value);
});

/**
 * Updates the stat pills and the summary sentence.
 * Always counts the full books[] array (ignores any active search).
 */
function updateStats() {
    const counts = countByStatus(books);

    totalCount.textContent = books.length;
    readingCount.textContent = counts['currently-reading'];
    completedCount.textContent = counts.completed;
    statusSummary.textContent = formatCounts(counts);
}

// Builds the trash icon with DOM methods (no innerHTML).
function createTrashIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const attrs = {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
    };
    Object.entries(attrs).forEach(([k, v]) => svg.setAttribute(k, v));

    const polyline = document.createElementNS(ns, 'polyline');
    polyline.setAttribute('points', '3 6 5 6 21 6');
    svg.appendChild(polyline);

    [
        'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
        'M10 11v6',
        'M14 11v6',
        'M9 6V4h6v2',
    ].forEach(d => {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', d);
        svg.appendChild(path);
    });

    return svg;
}

// Builds the dropdown used to change a book's status.
function createStatusPicker(book) {
    const picker = document.createElement('select');
    picker.className = 'status-select';
    picker.dataset.id = book.id;
    picker.setAttribute('aria-label', 'Change status of ' + book.title);

    STATUSES.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = STATUS_LABELS[status];
        option.selected = status === book.status;
        picker.appendChild(option);
    });

    return picker;
}

/**
 * Renders the book list, newest first.
 * @param {string} [rawQuery=''] - Optional search text; filters by title or author.
 * Uses textContent only (no innerHTML) to prevent XSS.
 * Never changes the books[] array.
 */
function renderBooks(rawQuery = '') {
    const visible = sortNewestFirst(filterBooks(books, rawQuery));

    // Remove every existing book card (leave the empty-state node in place)
    bookList.querySelectorAll('.book-card').forEach(card => card.remove());

    if (visible.length === 0) {
        emptyState.style.display = '';
        updateStats();
        return;
    }

    emptyState.style.display = 'none';

    visible.forEach(book => {
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

        // --- Actions group (badge + status dropdown + delete button) ---
        const actions = document.createElement('div');
        actions.className = 'book-card-actions';

        const badge = document.createElement('span');
        badge.className = 'book-badge badge-' + book.status;
        badge.textContent = STATUS_LABELS[book.status] || book.status;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-remove-book';
        deleteBtn.dataset.id = book.id;
        deleteBtn.setAttribute('aria-label', 'Delete ' + book.title);
        deleteBtn.appendChild(createTrashIcon());

        actions.appendChild(badge);
        actions.appendChild(createStatusPicker(book));
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

    const book = books.find(b => b.id === btn.dataset.id);
    if (!book) return;

    if (!confirm('Remove \u201c' + book.title + '\u201d from your library?')) return;

    books = deleteBook(books, book.id);
    saveBooks(books);
    renderBooks(searchBox.value);
});

// --- Change status: event-delegated change on #book-list ---
bookList.addEventListener('change', function (e) {
    const picker = e.target.closest('.status-select');
    if (!picker) return;

    books = updateStatus(books, picker.dataset.id, picker.value);
    saveBooks(books);
    renderBooks(searchBox.value);
});

// --- Search: filter display on every keystroke ---
searchBox.addEventListener('input', function () {
    renderBooks(this.value);
});

// --- First draw when the page opens ---
renderBooks();