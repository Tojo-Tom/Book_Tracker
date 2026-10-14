const {
  STATUSES,
  STATUS_LABELS,
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
} = require("./logic");

// ---------- helpers ----------
const makeBook = (title, author, status, createdAt) => ({
  id: `${title}-${createdAt}`,
  title,
  author,
  status,
  createdAt,
});

function createFakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    _data: data,
  };
}

const sample = () => [
  makeBook("Aadujeevitham", "Benyamin", "want-to-read", 1000),
  makeBook("Ponniyin Selvan", "Kalki", "currently-reading", 2000),
  makeBook("Khasakkinte Itihasam", "O. V. Vijayan", "completed", 3000),
];

// ---------- Step 1: status options ----------
describe("Step 1: statuses", () => {
  test("T1.2 offers exactly three statuses", () => {
    expect(STATUSES).toEqual(["want-to-read", "currently-reading", "completed"]);
  });

  test("each status has the label shown on screen", () => {
    expect(STATUS_LABELS).toEqual({
      "want-to-read": "To read",
      "currently-reading": "Reading",
      completed: "Finished",
    });
  });
});

// ---------- Step 3: validation and creation ----------
describe("Step 3: validateBook", () => {
  test("T3.1 empty title and author give both messages", () => {
    expect(validateBook("", "")).toEqual({
      title: "Please enter a title",
      author: "Please enter an author",
    });
  });

  test("T3.2 empty title only", () => {
    expect(validateBook("", "Benyamin")).toEqual({
      title: "Please enter a title",
    });
  });

  test("T3.3 empty author only", () => {
    expect(validateBook("Aadujeevitham", "")).toEqual({
      author: "Please enter an author",
    });
  });

  test("T3.4 whitespace-only title or author counts as empty", () => {
    expect(validateBook("   ", "Benyamin").title).toBe("Please enter a title");
    expect(validateBook("Aadujeevitham", "   ").author).toBe(
      "Please enter an author"
    );
  });

  test("T3.5 valid input returns no errors", () => {
    expect(validateBook("Aadujeevitham", "Benyamin")).toEqual({});
  });

  test("handles null and undefined without throwing", () => {
    expect(validateBook(null, undefined)).toEqual({
      title: "Please enter a title",
      author: "Please enter an author",
    });
  });
});

describe("Step 3: createBook", () => {
  test("T3.6 builds a book object with trimmed fields", () => {
    const b = createBook("  Aadujeevitham ", " Benyamin  ", "want-to-read", 5000);
    expect(b).toMatchObject({
      title: "Aadujeevitham",
      author: "Benyamin",
      status: "want-to-read",
      createdAt: 5000,
    });
    expect(typeof b.id).toBe("string");
  });

  test("defaults the status to To read", () => {
    expect(createBook("A", "B").status).toBe("want-to-read");
  });

  test("F2 identical books still get different ids", () => {
    const a = createBook("Same", "Same", "want-to-read", 1);
    const b = createBook("Same", "Same", "want-to-read", 1);
    expect(a.id).not.toBe(b.id);
  });
});

// ---------- Step 4: ordering ----------
describe("Step 4: sortNewestFirst", () => {
  test("T4.1 newest book comes first", () => {
    const sorted = sortNewestFirst(sample());
    expect(sorted.map((b) => b.title)).toEqual([
      "Khasakkinte Itihasam",
      "Ponniyin Selvan",
      "Aadujeevitham",
    ]);
  });

  test("does not change the original array", () => {
    const books = sample();
    sortNewestFirst(books);
    expect(books[0].title).toBe("Aadujeevitham");
  });

  test("T4.3 empty list returns an empty list", () => {
    expect(sortNewestFirst([])).toEqual([]);
  });

  test("F3 50 books come out in strictly descending order", () => {
    const books = Array.from({ length: 50 }, (_, i) =>
      makeBook(`Book ${i}`, "Author", "want-to-read", i)
    );
    const sorted = sortNewestFirst(books);
    expect(sorted[0].title).toBe("Book 49");
    expect(sorted[49].title).toBe("Book 0");
  });
});

// ---------- Step 5: persistence ----------
describe("Step 5: saveBooks / loadBooks", () => {
  test("T5.1 saved books load back identically", () => {
    const storage = createFakeStorage();
    const books = sample();
    saveBooks(books, storage);
    expect(loadBooks(storage)).toEqual(books);
  });

  test("T5.2 order is preserved", () => {
    const storage = createFakeStorage();
    const books = sample();
    saveBooks(books, storage);
    expect(loadBooks(storage).map((b) => b.title)).toEqual(
      books.map((b) => b.title)
    );
  });

  test("T5.3 first visit (nothing stored) returns an empty list", () => {
    expect(loadBooks(createFakeStorage())).toEqual([]);
  });

  test("T5.4 corrupted JSON does not crash and returns an empty list", () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: "{not valid json" });
    expect(loadBooks(storage)).toEqual([]);
  });

  test("stored value that is not an array returns an empty list", () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: '{"a":1}' });
    expect(loadBooks(storage)).toEqual([]);
  });
});

// ---------- Step 6: change status ----------
describe("Step 6: updateStatus", () => {
  test("T6.1 changes Reading to Finished", () => {
    const books = updateStatus(sample(), "Ponniyin Selvan-2000", "completed");
    expect(books.find((b) => b.title === "Ponniyin Selvan").status).toBe(
      "completed"
    );
  });

  test("T6.3 only the chosen book changes and order stays the same", () => {
    const before = sample();
    const after = updateStatus(before, "Ponniyin Selvan-2000", "completed");
    expect(after.map((b) => b.title)).toEqual(before.map((b) => b.title));
    expect(after[0].status).toBe("want-to-read");
    expect(after[2].status).toBe("completed");
  });

  test("does not change the original array", () => {
    const before = sample();
    updateStatus(before, "Ponniyin Selvan-2000", "completed");
    expect(before[1].status).toBe("currently-reading");
  });

  test("ignores an invalid status", () => {
    const before = sample();
    const after = updateStatus(before, "Ponniyin Selvan-2000", "Abandoned");
    expect(after).toEqual(before);
  });

  test("unknown id changes nothing", () => {
    const before = sample();
    expect(updateStatus(before, "nope", "completed")).toEqual(before);
  });

  test("T6.2 updated status survives save and load", () => {
    const storage = createFakeStorage();
    const updated = updateStatus(sample(), "Ponniyin Selvan-2000", "completed");
    saveBooks(updated, storage);
    const loaded = loadBooks(storage);
    expect(loaded.find((b) => b.title === "Ponniyin Selvan").status).toBe(
      "completed"
    );
  });

  test("F2 changing one of two same-titled books leaves the other alone", () => {
    const twins = [
      makeBook("Same", "Same", "want-to-read", 1),
      makeBook("Same", "Same", "want-to-read", 2),
    ];
    const after = updateStatus(twins, "Same-1", "completed");
    expect(after[0].status).toBe("completed");
    expect(after[1].status).toBe("want-to-read");
  });
});

// ---------- Step 7: search ----------
describe("Step 7: filterBooks", () => {
  test("T7.1 'ben' matches by author", () => {
    const result = filterBooks(sample(), "ben");
    expect(result.map((b) => b.title)).toEqual(["Aadujeevitham"]);
  });

  test("matches by title", () => {
    const result = filterBooks(sample(), "ponniyin");
    expect(result.map((b) => b.title)).toEqual(["Ponniyin Selvan"]);
  });

  test("T7.2 is case-insensitive", () => {
    expect(filterBooks(sample(), "BEN")).toEqual(filterBooks(sample(), "ben"));
  });

  test("T7.3 no match returns an empty list", () => {
    expect(filterBooks(sample(), "zzzz")).toEqual([]);
  });

  test("T7.4 empty or blank query returns all books", () => {
    expect(filterBooks(sample(), "")).toHaveLength(3);
    expect(filterBooks(sample(), "   ")).toHaveLength(3);
  });

  test("T7.5 filter still works after a status change", () => {
    const updated = updateStatus(sample(), "Aadujeevitham-1000", "completed");
    const result = filterBooks(updated, "ben");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("completed");
  });

  test("T7.6 a newly added matching book shows up", () => {
    const books = [...sample(), createBook("Benyamin's Stories", "Someone", "want-to-read", 4000)];
    expect(filterBooks(books, "ben")).toHaveLength(2);
  });

  test("searching never removes books from the original list", () => {
    const books = sample();
    filterBooks(books, "ben");
    expect(books).toHaveLength(3);
  });
});

// ---------- Step 8: delete ----------
describe("Step 8: deleteBook", () => {
  test("T8.1 removes only the chosen book", () => {
    const after = deleteBook(sample(), "Ponniyin Selvan-2000");
    expect(after.map((b) => b.title)).toEqual([
      "Aadujeevitham",
      "Khasakkinte Itihasam",
    ]);
  });

  test("T8.2 deletion survives save and load", () => {
    const storage = createFakeStorage();
    saveBooks(deleteBook(sample(), "Ponniyin Selvan-2000"), storage);
    expect(loadBooks(storage)).toHaveLength(2);
  });

  test("T8.3 deleting the last book leaves an empty list", () => {
    const one = [makeBook("Only", "One", "want-to-read", 1)];
    expect(deleteBook(one, "Only-1")).toEqual([]);
  });

  test("unknown id changes nothing", () => {
    expect(deleteBook(sample(), "nope")).toHaveLength(3);
  });
});

// ---------- Step 9: counts ----------
describe("Step 9: counts", () => {
  test("counts books per status", () => {
    expect(countByStatus(sample())).toEqual({
      "want-to-read": 1,
      "currently-reading": 1,
      completed: 1,
    });
  });

  test("T9.1 adding a To read book raises that count by 1", () => {
    const books = [...sample(), createBook("New", "Author", "want-to-read", 4000)];
    expect(countByStatus(books)["want-to-read"]).toBe(2);
  });

  test("T9.2 changing To read to Finished moves the counts", () => {
    const updated = updateStatus(sample(), "Aadujeevitham-1000", "completed");
    const counts = countByStatus(updated);
    expect(counts["want-to-read"]).toBe(0);
    expect(counts.completed).toBe(2);
  });

  test("T9.3 deleting a book lowers its count", () => {
    const counts = countByStatus(deleteBook(sample(), "Khasakkinte Itihasam-3000"));
    expect(counts.completed).toBe(0);
  });

  test("empty list gives all zeros", () => {
    expect(countByStatus([])).toEqual({ "want-to-read": 0, "currently-reading": 0, completed: 0 });
  });

  test("formatCounts leaves out statuses with a zero count", () => {
    expect(formatCounts({ "want-to-read": 2, "currently-reading": 0, completed: 3 })).toBe(
      "3 finished, 2 to read"
    );
    expect(formatCounts({ "want-to-read": 0, "currently-reading": 0, completed: 0 })).toBe("");
  });

  test("formatCounts builds the display text", () => {
    expect(formatCounts({ "want-to-read": 2, "currently-reading": 1, completed: 3 })).toBe(
      "3 finished, 1 reading, 2 to read"
    );
  });
});

// ---------- Example table from the brief, end to end ----------
describe("End to end: the example from the brief", () => {
  test("add, search, change status, refresh", () => {
    const storage = createFakeStorage();

    // Add "Aadujeevitham" by Benyamin, To read
    expect(validateBook("Aadujeevitham", "Benyamin")).toEqual({});
    let books = loadBooks(storage);
    books = [...books, createBook("Aadujeevitham", "Benyamin", "want-to-read", 1000)];
    saveBooks(books, storage);

    // It appears at the top with a "want-to-read" label
    const top = sortNewestFirst(books)[0];
    expect(top.title).toBe("Aadujeevitham");
    expect(top.status).toBe("want-to-read");

    // Add with the title empty shows the message
    expect(validateBook("", "Someone").title).toBe("Please enter a title");

    // Search "ben"
    expect(filterBooks(books, "ben")).toHaveLength(1);

    // Change the status to Finished
    books = updateStatus(books, top.id, "completed");
    saveBooks(books, storage);
    expect(books[0].status).toBe("completed");

    // "Refresh the page": load again from storage
    const reloaded = loadBooks(storage);
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].status).toBe("completed");
  });
});