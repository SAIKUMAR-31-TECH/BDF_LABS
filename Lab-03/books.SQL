CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

INSERT OR IGNORE INTO book (id, title, author, price, pages) VALUES
(1, 'Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336),
(2, 'Atomic Habits', 'James Clear', 450, 320),
(3, 'The Power of Now', 'Eckhart Tolle', 300, 236),
(4, 'Ikigai', 'Hector Garcia', 250, 208),
(5, 'Think and Grow Rich', 'Napoleon Hill', 400, 320),
(6, 'Deep Work', 'Cal Newport', 380, 296),
(7, 'The Alchemist', 'Paulo Coelho', 280, 208),
(8, 'Wings of Fire', 'A.P.J. Abdul Kalam', 320, 180),
(9, 'The 5 AM Club', 'Robin Sharma', 420, 336),
(10, 'The Monk Who Sold His Ferrari', 'Robin Sharma', 350, 198);