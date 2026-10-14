let books = [];

console.log(books);

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
  };

  books.push(book);
  console.log(books);

  // Clear the form
  form.reset();
});
