const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "books.db");

const initialBooks = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 450, pages: 180 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", price: 399, pages: 281 },
  { title: "1984", author: "George Orwell", price: 499, pages: 328 },
  { title: "Pride and Prejudice", author: "Jane Austen", price: 299, pages: 279 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 350, pages: 214 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, pages: 310 },
  { title: "Fahrenheit 451", author: "Ray Bradbury", price: 420, pages: 249 },
  { title: "Brave New World", author: "Aldous Huxley", price: 480, pages: 268 },
  { title: "The Alchemist", author: "Paulo Coelho", price: 350, pages: 208 },
  { title: "Clean Code", author: "Robert C. Martin", price: 850, pages: 464 }
];

async function initializeDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log("Connected to SQLite database at:", dbPath);

  await db.exec(`
    DROP TABLE IF EXISTS book;
    CREATE TABLE book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL,
      pages INTEGER NOT NULL
    );
  `);

  console.log("Created table 'book' with schema: (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT, price INTEGER, pages INTEGER)");

  for (const book of initialBooks) {
    await db.run(
      `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
      [book.title, book.author, book.price, book.pages]
    );
  }

  const count = await db.get(`SELECT COUNT(*) AS count FROM book;`);
  console.log(`Successfully seeded ${count.count} rows into the database.`);

  const books = await db.all(`SELECT * FROM book;`);
  console.table(books);

  await db.close();
  console.log("Database connection closed. books.db is ready!");
}

initializeDatabase().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

