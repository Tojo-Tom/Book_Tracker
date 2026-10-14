# Prompt log

A record of the important prompts I used while building the book reading list, what I asked, and what happened. Mistakes made by the AI are marked **AI mistake**, with how I noticed each one and how it was fixed.

---

## Prompt 1: Planning the project

**Prompt:** I pasted the project brief (add a book, list newest first, search, change status, keep data after refresh) and asked: "create a work flow, where to start, suggestions for which languages to use and why, develop test cases for each scenarios, step by step guide to follow alone. Break big work into small steps, and build and test one step at a time."

**What happened:** The AI recommended plain HTML, CSS and JavaScript with localStorage, since the app is too small to need a framework or a server. It gave an 11-step build order (skeleton, data model, add with validation, render newest first, save and load, change status, search, delete, counts, phone layout, final test pass). Each step had its own test cases, for example T3.4 (a title with only spaces counts as empty) and T7.2 (search ignores upper and lower case).

---

## Prompt 2: Automated tests with Jest

**Prompt:** "write automated tests with Jest."

**What happened:** The AI split the logic out of the page into a new `logic.js` of pure functions (validation, sorting, search, status change, delete, counts, save and load) so they could be tested without the browser. It wrote `logic.test.js` with 45 tests that follow the test IDs from Prompt 1, and ran them before giving them to me. It also told me which checks Jest can't do (for example whether HTML typed as a title shows as plain text, and the phone layout), so I test those by hand in the browser.

---

## Prompt 3: Safe rendering & XSS prevention

**Prompt:** "Write renderBooks(). Sort a copy by createdAt descending, loop through it and create an element per book showing the title, author and a status label. Call it after every change. Use textContent, not innerHTML, so typed text can't inject HTML."

**What happened:** The AI implemented `renderBooks()` by sorting a shallow copy (`books.slice().sort(...)`) by `createdAt` descending so the master array is never mutated. It created card elements using `document.createElement()` and populated titles and authors using `textContent` instead of `innerHTML`, neutralizing any script injection or HTML formatting in user input. It also toggled the empty-state container and re-rendered the display on every state change.

---

## Prompt 4: Non-destructive live search

**Prompt:** "On every input event in the search box, filter by title or author using lowercase includes(). Filter only the display. Never remove anything from books itself."

**What happened:** The AI attached an `input` event listener to the search input. It normalized queries and text using `.toLowerCase().includes()` across both title and author fields. The filter was strictly applied to the slice of books passed into the view renderer, leaving the master `books` array and `localStorage` completely intact.

---

## Prompt 5: Deletion, dynamic status summary & responsive layout

**Prompt:** "A Delete button per book. Filter the book out by id, save and re-render. A confirm() prompt is a nice touch. Count by status and show '3 finished, 2 reading, 1 to read'. Update it inside renderBooks(). Add `<meta name="viewport" content="width=device-width, initial-scale=1">`. Stack the form fields vertically on small screens, make buttons at least 44px tall, and use max-width on the container."

**What happened:** The AI added delete action buttons with a `window.confirm()` confirmation modal to prevent accidental data loss, removing books by their unique ID, saving to `localStorage`, and re-rendering. It integrated a dynamic reading summary sentence that counts items by status and omits zero counts. It also added the viewport `<meta>` tag, enforced 44px minimum touch targets for WCAG accessibility, and introduced responsive CSS media queries that stack form controls vertically on small screens.

---

## Summary of the prompts

| Prompt | Goal | What was delivered | Key takeaway |
|---|---|---|---|
| **Prompt 1: Planning the project** | Architecture, workflow, and test strategy | Plain HTML/CSS/JS + localStorage architecture with an 11-step incremental roadmap and manual test cases | Breaking requirements into small, verifiable increments prevents overengineering. |
| **Prompt 2: Automated tests with Jest** | Headless unit testing | Extracted pure functions into `logic.js` and wrote 45 Jest tests in `logic.test.js` | Decoupling pure business logic from the DOM allows fast, reliable headless testing. |
| **Prompt 3: Safe rendering & XSS prevention** | Secure, chronological display pipeline | Non-mutating `books.slice().sort()` render function using `textContent` and `createElement` | Always use `textContent` over `innerHTML` for untrusted user inputs to block XSS vulnerabilities. |
| **Prompt 4: Non-destructive live search** | Instant view filtering | Case-insensitive search on `input` events filtering only the render pipeline | UI filters must remain separate from state storage so searches never mutate data. |
| **Prompt 5: Deletion, status summary & mobile UX** | Complete book lifecycle & mobile usability | Delete with `confirm()`, dynamic status sentence, 44px touch targets, and responsive mobile form | Combine user safeguards (delete confirmation) with mobile-first accessibility standards. |

## Summary: where the AI went wrong & limitations

| Problem | How I noticed | How it was fixed |
|---|---|---|
| **Prompt 1:** Architecture did not separate DOM manipulation from core business logic upfront | Discovered when trying to run automated unit tests in Node/Jest without a browser | Extracted pure logic into `logic.js` separate from `app.js` so it could run headlessly |
| **Prompt 2:** Jest tests could not verify browser-only behaviors (HTML injection safety, CSS responsiveness) | Noticed while reviewing which test cases Jest could and could not execute | Defined a manual browser checklist for DOM and layout verification alongside Jest tests |
| **Prompt 3:** Potential state mutation when sorting books for rendering | Checked whether `.sort()` was being called directly on the master `books` array | Used `books.slice().sort()` to sort a shallow copy, preserving original array order |
| **Prompt 4:** Risk of accidentally removing items from `books` array during search | Verified state integrity after clearing search box | Ensured search only passes a filtered copy to `renderBooks()` without touching `books` or `localStorage` |
| **Prompt 5:** Mobile touch targets and responsive layout needed browser verification | Inspected on mobile viewports and checked button sizes | Added `min-height: 44px` and stacked input fields vertically in `@media (max-width: 600px)` |

## What I learned

- **Decouple business logic from UI early:** Isolating pure functions (validation, sorting, filtering, status formatting) into `logic.js` makes automated testing simple and reliable.
- **Understand automated test boundaries:** Jest is great for pure logic, but browser-specific behaviors like XSS prevention (`textContent`) and responsive CSS layout still require manual browser testing.
- **Defend against data mutation:** Use shallow copies (`.slice()`) when sorting or filtering to keep application state and `localStorage` immutable.
- **Mobile accessibility matters from day one:** Viewport configuration, touch target sizing (≥44px), and flexible column layouts ensure the app works on all devices.
