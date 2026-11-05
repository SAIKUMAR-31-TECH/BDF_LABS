
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "books.db");

let db = null;

// Initialize Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create book table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Insert sample books if database is empty
    const result = await db.get(
      "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
      await db.run(`
        INSERT INTO book (title, author, price, pages)
        VALUES
        ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336),
        ('Atomic Habits', 'James Clear', 450, 320),
        ('The Power of Now', 'Eckhart Tolle', 300, 236),
        ('Ikigai', 'Hector Garcia', 250, 208),
        ('Think and Grow Rich', 'Napoleon Hill', 400, 320),
        ('Deep Work', 'Cal Newport', 380, 296),
        ('The Alchemist', 'Paulo Coelho', 280, 208),
        ('Wings of Fire', 'A.P.J. Abdul Kalam', 320, 180),
        ('The 5 AM Club', 'Robin Sharma', 420, 336),
        ('The Monk Who Sold His Ferrari', 'Robin Sharma', 350, 198)
      `);
    }

    console.log("Database initialized successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.log("Database Error:", error.message);
    process.exit(1);
  }
};

initializeDBAndServer();


// 1. GET ALL BOOKS
// Search, sorting, filtering and pagination

app.get("/books", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = request.query;

    // Validate sorting column
    const allowedColumns = [
      "id",
      "title",
      "author",
      "price",
      "pages",
    ];

    if (!allowedColumns.includes(order_by)) {
      return response.status(400).json({
        message: "Invalid sorting column",
      });
    }

    // Validate sorting order
    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return response.status(400).json({
        message: "Order must be ASC or DESC",
      });
    }

    // Validate limit and offset
    const limitValue = Number(limit);
    const offsetValue = Number(offset);

    if (
      !Number.isInteger(limitValue) ||
      limitValue <= 0 ||
      !Number.isInteger(offsetValue) ||
      offsetValue < 0
    ) {
      return response.status(400).json({
        message: "Invalid limit or offset",
      });
    }

    const conditions = [];
    const values = [];

    // Search books by title
    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      values.push(`%${search_q.trim()}%`);
    }

    // Minimum price filter
    if (min_price !== undefined) {
      const min = Number(min_price);

      if (!Number.isFinite(min) || min < 0) {
        return response.status(400).json({
          message: "Invalid minimum price",
        });
      }

      conditions.push("price >= ?");
      values.push(min);
    }

    // Maximum price filter
    if (max_price !== undefined) {
      const max = Number(max_price);

      if (!Number.isFinite(max) || max < 0) {
        return response.status(400).json({
          message: "Invalid maximum price",
        });
      }

      conditions.push("price <= ?");
      values.push(max);
    }

    // Validate price range
    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return response.status(400).json({
        message: "Minimum price cannot exceed maximum price",
      });
    }

    // Build SQL query
    let sqlQuery = "SELECT * FROM book";

    if (conditions.length > 0) {
      sqlQuery += " WHERE " + conditions.join(" AND ");
    }

    sqlQuery += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;

    values.push(limitValue, offsetValue);

    const books = await db.all(sqlQuery, values);

    return response.status(200).json(books);

  } catch (error) {
    console.log("GET BOOKS ERROR:", error.message);

    return response.status(500).json({
      message: "Unable to get books",
    });
  }
});


// 2. GET BOOK BY ID

app.get("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!book) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    return response.status(200).json(book);

  } catch (error) {
    console.log("GET BOOK ERROR:", error.message);

    return response.status(500).json({
      message: "Unable to get book",
    });
  }
});


// 3. ADD NEW BOOK

app.post("/books", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    // Validate request body
    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      pages === undefined ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) <= 0
    ) {
      return response.status(400).json({
        message: "Provide valid title, author, price and pages",
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      title.trim(),
      author.trim(),
      Number(price),
      Number(pages),
    ]);

    return response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });

  } catch (error) {
    console.log("POST BOOK ERROR:", error.message);

    return response.status(500).json({
      message: "Unable to add book",
    });
  }
});


// 4. UPDATE BOOK BY ID

app.put("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

    // Validate request body
    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      pages === undefined ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) <= 0
    ) {
      return response.status(400).json({
        message: "Provide valid title, author, price and pages",
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [
        title.trim(),
        author.trim(),
        Number(price),
        Number(pages),
        bookId,
      ]
    );

    if (result.changes === 0) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    return response.status(200).json({
      message: "Book updated successfully",
    });

  } catch (error) {
    console.log("PUT BOOK ERROR:", error.message);

    return response.status(500).json({
      message: "Unable to update book",
    });
  }
});


// 5. DELETE BOOK BY ID

app.delete("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    return response.status(200).json({
      message: "Book deleted successfully",
    });

  } catch (error) {
    console.log("DELETE BOOK ERROR:", error.message);

    return response.status(500).json({
      message: "Unable to delete book",
    });
  }
});
