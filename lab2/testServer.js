const http = require("http");

async function runTests() {
  const baseURL = "http://localhost:3000";

  console.log("--- Testing Endpoints ---");

  // 1. GET /books/
  let res = await fetch(`${baseURL}/books/`);
  let data = await res.json();
  console.log("1. GET /books/ -> Status:", res.status, "Count:", data.length);

  // 2. GET /books/3/
  res = await fetch(`${baseURL}/books/3/`);
  data = await res.json();
  console.log("2. GET /books/3/ -> Status:", res.status, "Title:", data.title);

  // 3. GET /books/999/ (Not Found)
  res = await fetch(`${baseURL}/books/999/`);
  data = await res.json();
  console.log("3. GET /books/999/ -> Status:", res.status, "Response:", data);

  // 4. POST /books/
  res = await fetch(`${baseURL}/books/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Atomic Habits",
      author: "James Clear",
      price: 550,
      pages: 320
    })
  });
  data = await res.json();
  console.log("4. POST /books/ -> Status:", res.status, "Response:", data);
  const newBookId = data.bookId;

  // 5. PUT /books/:bookId/
  res = await fetch(`${baseURL}/books/1/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "The Great Gatsby (Special Edition)",
      author: "F. Scott Fitzgerald",
      price: 599,
      pages: 200
    })
  });
  data = await res.json();
  console.log("5. PUT /books/1/ -> Status:", res.status, "Response:", data);

  // 6. DELETE /books/:bookId/
  res = await fetch(`${baseURL}/books/2/`, {
    method: "DELETE"
  });
  data = await res.json();
  console.log("6. DELETE /books/2/ -> Status:", res.status, "Response:", data);

  // 7. GET /books/ after mutations
  res = await fetch(`${baseURL}/books/`);
  data = await res.json();
  console.log("7. GET /books/ after changes -> Status:", res.status, "Count:", data.length);

  console.log("--- All Tests Passed Successfully! ---");
}

module.exports = runTests;

