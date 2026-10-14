# BookTracker — Personal Reading Library

A modern, responsive web application for keeping track of your personal reading collection. Add books, search your library in real time, change reading statuses, and track your progress—all saved locally in your browser so your books remain intact after a page refresh.

## Features

- **Add a book** with a title, an author, and an initial reading status. Title and author fields are validated; empty or whitespace-only inputs trigger clear inline error messages under each field ("Please enter a title" or "Please enter an author").
- **Newest first:** Newly added books automatically appear at the top of the collection (`createdAt` descending order).
- **Non-destructive live search:** Search books instantly by title or author on every keystroke (case-insensitive) without altering the underlying saved library.
- **Change reading status:** Update any book's status on the fly directly from the dropdown on each card (e.g., from *Reading* to *Finished*).
- **Persistent storage:** Automatically synchronizes the collection with browser `localStorage`.
- **Safe deletion:** Delete books with a confirmation prompt modal to prevent accidental data loss.
- **Reading stats & summary:** Live counter pills for **Total Books**, **Reading**, and **Completed**, plus a human-readable summary sentence (e.g., *"3 finished, 2 to read"*).
- **Mobile-first responsive design:** Stacks form controls vertically on smaller screens, uses a lavender aesthetic with modern typography, and enforces WCAG-compliant touch target sizes (≥44px).

## Built with

- **HTML5:** Semantic markup with ARIA accessibility roles and labels
- **Modern Vanilla CSS:** Custom design system with a clean light lavender palette and responsive media queries
- **Plain JavaScript (ES6+):** Headless business logic separated cleanly from DOM manipulation
- **Browser LocalStorage:** Zero-dependency client-side data persistence
- **[Jest](https://jestjs.io/):** Comprehensive automated unit testing suite

## How to run

1. Download or clone this repository.
2. Open `index.html` directly in any modern web browser.

There are no runtime dependencies or build steps required to run the application.

## How to run the tests

Make sure [Node.js](https://nodejs.org/) is installed.

```bash
npm install
npm test
```

The 47 automated tests in `logic.test.js` verify all core business rules: input validation, chronological sorting, case-insensitive search filtering, status transitions, deletion, reading counts, and storage serialization/parsing.

## Project structure

| File | What it does |
|---|---|
| `index.html` | Semantic page structure and accessible layout |
| `style.css` | Light lavender design system, typography, card layout, and responsive breakpoints |
| `app.js` | UI/DOM event handlers: form submission, inline status changes, deletion, and rendering |
| `logic.js` | Pure business logic functions with zero DOM dependency for headless testability |
| `logic.test.js` | Automated Jest test suite (47 unit tests) covering `logic.js` |
| `PROMPTS.md` | Log of AI prompts, evolution of features, edge cases, and architectural learnings |

### Data Model

Each book is stored as a plain JavaScript object:

```js
{
  id: "1760000000000-a1b2c3",
  title: "Aadujeevitham",
  author: "Benyamin",
  status: "want-to-read",
  createdAt: 1760000000000
}
```

The internal status keys map as follows:
- `want-to-read`: Displayed as **Want to Read** in the form and **To read** on card badges.
- `currently-reading`: Displayed as **Currently Reading** in the form and **Reading** on card badges.
- `completed`: Displayed as **Completed** in the form and **Finished** on card badges.

## How it was built

Developed incrementally step by step, validating each milestone with unit tests and browser verification: page skeleton, validation, rendering, persistence, status management, live search, deletion, dynamic statistics, and mobile responsiveness. AI assistance was used for iterative problem solving, with the full prompt history and design adjustments recorded in [`PROMPTS.md`](PROMPTS.md).

## What the automated tests don't cover

Behavior dependent on visual layout or browser APIs is tested manually in the browser:
- **XSS prevention:** Verifying that user input containing HTML tags (e.g. `<script>`) renders strictly as plain text via `textContent`.
- **Responsive design:** Ensuring mobile screens adapt without horizontal scrollbars and touch targets remain accessible.
- **Interactive UI events:** Native `confirm()` dialogs and DOM class transitions.
