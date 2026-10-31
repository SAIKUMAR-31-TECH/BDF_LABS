const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Initialize Database connection and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create table if it doesn't already exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root route
app.get("/", (request, response) => {
  response.status(200).send("Welcome to Lab 2: SQLite Database and CRUD Routes Server!");
});

// Route 1: GET /books/ - Retrieve all books
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        id ASC;
    `;
    const booksList = await db.all(getBooksQuery);
    response.status(200).json(booksList);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 2: GET /books/:bookId/ - Retrieve a specific book by ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);
    if (!book) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found` });
    }
    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 3: POST /books/ - Add a new book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "Missing required fields: title, author, price, and pages are required."
      });
    }

    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;
    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
    const bookId = dbResponse.lastID;
    response.status(201).json({
      message: "Book Successfully Added",
      bookId: bookId
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 4: PUT /books/:bookId/ - Update an existing book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "Missing required fields: title, author, price, and pages are required."
      });
    }

    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;
    const dbResponse = await db.run(updateBookQuery, [title, author, price, pages, bookId]);
    if (dbResponse.changes === 0) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found` });
    }
    response.status(200).json({
      message: "Book Details Updated Successfully"
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 5: DELETE /books/:bookId/ - Delete a book by ID
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;
    const dbResponse = await db.run(deleteBookQuery, [bookId]);
    if (dbResponse.changes === 0) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found` });
    }
    response.status(200).json({
      message: "Book Deleted Successfully"
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;

