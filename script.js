/**
 * BookTracker - Core Application Logic
 * Manages form validation, adding books, real-time search, status filtering, and list rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const bookForm = document.getElementById('book-form');
  const titleInput = document.getElementById('book-title');
  const authorInput = document.getElementById('book-author');
  const statusSelect = document.getElementById('book-status');

  // Error message containers
  const titleError = document.getElementById('title-error');
  const authorError = document.getElementById('author-error');
  const statusError = document.getElementById('status-error');

  // Search & Filters
  const searchBox = document.getElementById('search-box');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // List & Empty state
  const bookListContainer = document.getElementById('book-list');
  const emptyState = document.getElementById('empty-state');

  // Stats Counters
  const totalCountEl = document.getElementById('total-count');
  const readingCountEl = document.getElementById('reading-count');
  const completedCountEl = document.getElementById('completed-count');

  // In-memory book storage
  let books = [];
  let currentFilter = 'all';
  let searchQuery = '';

  // --- Validation Helpers ---

  /**
   * Display an error message under an input field
   * @param {HTMLElement} inputEl - The input or select element
   * @param {HTMLElement} errorEl - The error message container
   * @param {string} message - Validation error message to display
   */
  function showError(inputEl, errorEl, message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
    errorEl.classList.add('has-error');
  }

  /**
   * Clear error message and styling for an input field
   * @param {HTMLElement} inputEl - The input or select element
   * @param {HTMLElement} errorEl - The error message container
   */
  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('input-error');
    errorEl.textContent = '';
    errorEl.classList.remove('has-error');
  }

  /**
   * Validate all form fields
   * @returns {boolean} True if all fields are valid, false otherwise
   */
  function validateForm() {
    let isValid = true;
    let firstInvalidField = null;

    // Validate Title
    const titleVal = titleInput.value.trim();
    if (!titleVal) {
      showError(titleInput, titleError, 'Please enter a book title.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = titleInput;
    } else {
      clearError(titleInput, titleError);
    }

    // Validate Author
    const authorVal = authorInput.value.trim();
    if (!authorVal) {
      showError(authorInput, authorError, 'Please enter the author name.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = authorInput;
    } else {
      clearError(authorInput, authorError);
    }

    // Validate Status Dropdown
    const statusVal = statusSelect.value;
    if (!statusVal) {
      showError(statusSelect, statusError, 'Please select a reading status.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = statusSelect;
    } else {
      clearError(statusSelect, statusError);
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return isValid;
  }

  // Real-time error clearance on user input
  titleInput.addEventListener('input', () => {
    if (titleInput.value.trim()) clearError(titleInput, titleError);
  });

  authorInput.addEventListener('input', () => {
    if (authorInput.value.trim()) clearError(authorInput, authorError);
  });

  statusSelect.addEventListener('change', () => {
    if (statusSelect.value) clearError(statusSelect, statusError);
  });

  // --- Render & UI Helpers ---

  /**
   * Format human-readable status badge
   * @param {string} status 
   * @returns {{label: string, className: string}}
   */
  function getStatusMeta(status) {
    switch (status) {
      case 'want-to-read':
        return { label: 'Want to Read', className: 'badge-want-to-read' };
      case 'currently-reading':
        return { label: 'Currently Reading', className: 'badge-currently-reading' };
      case 'completed':
        return { label: 'Completed', className: 'badge-completed' };
      default:
        return { label: status, className: '' };
    }
  }

  /**
   * Update header stats counters
   */
  function updateStats() {
    totalCountEl.textContent = books.length;
    readingCountEl.textContent = books.filter(b => b.status === 'currently-reading').length;
    completedCountEl.textContent = books.filter(b => b.status === 'completed').length;
  }

  /**
   * Render the list of books based on current filter & search query
   */
  function renderBookList() {
    // Filter books by status tab and search keyword
    const filteredBooks = books.filter(book => {
      const matchesFilter = currentFilter === 'all' || book.status === currentFilter;
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });

    // Clear existing book cards (excluding empty-state template)
    bookListContainer.innerHTML = '';

    if (filteredBooks.length === 0) {
      // If no matching books, show appropriate empty state
      const isSearching = searchQuery.length > 0 || currentFilter !== 'all';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.id = 'empty-state';
      emptyDiv.innerHTML = `
        <div class="empty-icon-wrapper" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-5z"></path>
            <path d="M6 2v20"></path>
            <line x1="10" y1="7" x2="16" y2="7"></line>
            <line x1="10" y1="11" x2="16" y2="11"></line>
            <line x1="10" y1="15" x2="13" y2="15"></line>
          </svg>
        </div>
        <h3 class="empty-title">${isSearching ? 'No matching books found' : 'Your library is currently empty'}</h3>
        <p class="empty-description">${
          isSearching 
            ? 'Try adjusting your search terms or filter selection.' 
            : 'Fill out the form above and click &ldquo;Add Book&rdquo; to start building your reading collection.'
        }</p>
      `;
      bookListContainer.appendChild(emptyDiv);
      return;
    }

    // Render individual book cards
    filteredBooks.forEach(book => {
      const statusMeta = getStatusMeta(book.status);

      const card = document.createElement('article');
      card.className = 'book-card';
      card.dataset.id = book.id;

      card.innerHTML = `
        <div class="book-info">
          <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
          <p class="book-card-author">by ${escapeHtml(book.author)}</p>
        </div>
        <div class="book-card-actions">
          <span class="book-badge ${statusMeta.className}">${statusMeta.label}</span>
          <button type="button" class="btn-remove-book" aria-label="Remove book ${escapeHtml(book.title)}" title="Delete book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;

      // Delete listener
      const deleteBtn = card.querySelector('.btn-remove-book');
      deleteBtn.addEventListener('click', () => {
        deleteBook(book.id);
      });

      bookListContainer.appendChild(card);
    });
  }

  /**
   * Sanitize text against XSS injection
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Delete book by ID
   */
  function deleteBook(id) {
    books = books.filter(b => b.id !== id);
    updateStats();
    renderBookList();
  }

  // --- Form Submission ---
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newBook = {
      id: Date.now().toString(),
      title: titleInput.value.trim(),
      author: authorInput.value.trim(),
      status: statusSelect.value,
      createdAt: new Date()
    };

    // Add to books array
    books.unshift(newBook);

    // Reset form and errors
    bookForm.reset();
    clearError(titleInput, titleError);
    clearError(authorInput, authorError);
    clearError(statusSelect, statusError);

    // Update UI
    updateStats();
    renderBookList();

    // Re-focus title for smooth keyboard workflow
    titleInput.focus();
  });

  // --- Search Box Logic ---
  searchBox.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
    renderBookList();
  });

  searchClearBtn.addEventListener('click', () => {
    searchBox.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    renderBookList();
    searchBox.focus();
  });

  // --- Filter Tabs Logic ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      renderBookList();
    });
  });

  // Initial update
  updateStats();
});
