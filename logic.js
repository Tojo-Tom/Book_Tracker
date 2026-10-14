// logic.js - pure functions with no DOM access, so they are easy to test.
// In the browser these become globals (load this file before app.js).
// In Node/Jest they are exported through module.exports at the bottom.

const STATUSES = ["To read", "Reading", "Finished"];
const STORAGE_KEY = "books";

// Returns an object with an error message for each invalid field.
// An empty object means the input is valid.
function validateBook(title, author) {
  const errors = {};
  if (!String(title ?? "").trim()) errors.title = "Please enter a title";
  if (!String(author ?? "").trim()) errors.author = "Please enter an author";
  return errors;
}

function createBook(title, author, status = "To read", now = Date.now()) {
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(title).trim(),
    author: String(author).trim(),
    status,
    createdAt: now,
  };
}

// Returns a sorted copy, newest first. Does not change the original array.
function sortNewestFirst(books) {
  return [...books].sort((a, b) => b.createdAt - a.createdAt);
}

// Case-insensitive search on title or author. Empty query returns everything.
function filterBooks(books, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return books;
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
}

// Returns a new array with one book's status changed. Ignores invalid statuses.
function updateStatus(books, id, status) {
  if (!STATUSES.includes(status)) return books;
  return books.map((b) => (b.id === id ? { ...b, status } : b));
}

function deleteBook(books, id) {
  return books.filter((b) => b.id !== id);
}

function countByStatus(books) {
  const counts = { "To read": 0, Reading: 0, Finished: 0 };
  for (const b of books) {
    if (b.status in counts) counts[b.status] += 1;
  }
  return counts;
}

function formatCounts(counts) {
  return `${counts.Finished} finished, ${counts.Reading} reading, ${counts["To read"]} to read`;
}

// `storage` is passed in so tests can use a fake instead of the real localStorage.
function saveBooks(books, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function loadBooks(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STATUSES,
    STORAGE_KEY,
    validateBook,
    createBook,
    sortNewestFirst,
    filterBooks,
    updateStatus,
    deleteBook,
    countByStatus,
    formatCounts,
    saveBooks,
    loadBooks,
  };
}
