CREATE TABLE book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

INSERT INTO book (title, author, price, pages)
VALUES
  ('The Great Gatsby', 'F. Scott Fitzgerald', 450, 180),
  ('To Kill a Mockingbird', 'Harper Lee', 399, 281),
  ('1984', 'George Orwell', 499, 328),
  ('Pride and Prejudice', 'Jane Austen', 299, 279),
  ('The Catcher in the Rye', 'J.D. Salinger', 350, 214),
  ('The Hobbit', 'J.R.R. Tolkien', 599, 310),
  ('Fahrenheit 451', 'Ray Bradbury', 420, 249),
  ('Brave New World', 'Aldous Huxley', 480, 268),
  ('The Alchemist', 'Paulo Coelho', 350, 208),
  ('Clean Code', 'Robert C. Martin', 850, 464);
