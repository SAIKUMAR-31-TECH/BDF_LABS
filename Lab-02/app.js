const express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    const result = await db.get(
      "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
      await db.run(`
        INSERT INTO book (title, author, price, pages) 
        VALUES
        ('Wings of Fire', 'A.P.J. Abdul Kalam', 250, 180),
        ('The Alchemist', 'Paulo Coelho', 300, 208),
        ('Atomic Habits', 'James Clear', 450, 320),
        ('Ikigai', 'Hector Garcia', 350, 194),
        ('Rich Dad Poor Dad', 'Robert Kiyosaki', 400, 336),
        ('The Power of Habit', 'Charles Duhigg', 420, 371),
        ('Deep Work', 'Cal Newport', 380, 296),
        ('Think Like a Monk', 'Jay Shetty', 399, 288),
        ('The Psychology of Money', 'Morgan Housel', 350, 256),
        ('The 5 AM Club', 'Robin Sharma', 450, 336);
      `);

      console.log("10 sample books inserted successfully");
    }

    app.get("/", (request, response) => {
      response.send("Books CRUD API is running");
    });

    app.get("/books/", async (request, response) => {
      try {
        const books = await db.all(
          "SELECT * FROM book ORDER BY id"
        );
        response.status(200).send(books);
      } catch (error) {
        response.status(500).send({ error: "Failed to retrieve books" });
      }
    });

    app.get("/books/:bookId/", async (request, response) => {
      try {
        const { bookId } = request.params;

        const book = await db.get(
          "SELECT * FROM book WHERE id = ?",
          [bookId]
        );

        if (!book) {
          return response.status(404).send({ error: "Book not found" });
        }

        response.status(200).send(book);
      } catch (error) {
        response.status(500).send({ error: "Failed to retrieve book" });
      }
    });

    app.post("/books/", async (request, response) => {
      try {
        const { title, author, price, pages } = request.body;

        if (
          typeof title !== "string" || !title.trim() ||
          typeof author !== "string" || !author.trim() ||
          !Number.isInteger(price) || price < 0 ||
          !Number.isInteger(pages) || pages <= 0
        ) {
          return response.status(400).send({
            error: "Enter a valid title, author, price and pages",
          });
        }

        const result = await db.run(
          `INSERT INTO book (title, author, price, pages)
           VALUES (?, ?, ?, ?)`,
          [title.trim(), author.trim(), price, pages]
        );

        response.status(201).send({
          message: "Book added successfully",
          bookId: result.lastID,
        });
      } catch (error) {
        response.status(500).send({ error: "Failed to add book" });
      }
    });

    app.put("/books/:bookId/", async (request, response) => {
      try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        if (
          typeof title !== "string" || !title.trim() ||
          typeof author !== "string" || !author.trim() ||
          !Number.isInteger(price) || price < 0 ||
          !Number.isInteger(pages) || pages <= 0
        ) {
          return response.status(400).send({
            error: "Enter a valid title, author, price and pages",
          });
        }

        const result = await db.run(
          `UPDATE book
           SET title = ?, author = ?, price = ?, pages = ?
           WHERE id = ?`,
          [title.trim(), author.trim(), price, pages, bookId]
        );

        if (result.changes === 0) {
          return response.status(404).send({ error: "Book not found" });
        }

        response.status(200).send({
          message: "Book updated successfully",
        });
      } catch (error) {
        response.status(500).send({ error: "Failed to update book" });
      }
    });

    app.delete("/books/:bookId/", async (request, response) => {
      try {
        const { bookId } = request.params;

        const result = await db.run(
          "DELETE FROM book WHERE id = ?",
          [bookId]
        );

        if (result.changes === 0) {
          return response.status(404).send({ error: "Book not found" });
        }

        response.status(200).send({
          message: "Book deleted successfully",
        });
      } catch (error) {
        response.status(500).send({ error: "Failed to delete book" });
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
