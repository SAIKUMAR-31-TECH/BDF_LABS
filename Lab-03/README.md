# Lab 03 – REST API, Query Parameters, Validation and Debugging

## Student Details

- Name: Neela Sai Kumar
- Registration Number: 252U1R9108
- Section: CSE-GEN AI -2B
- Course: Backend Development Fundamentals
- Year: II
- Term: II
- Faculty: Joel Prashanth D.

## 1. Objective

To develop a REST API using Node.js, Express.js and SQLite. This lab demonstrates CRUD operations, query parameters, filtering, sorting, pagination, input validation and error handling.

## 2. Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman
- Visual Studio Code

## 3. Project Structure

```text
Lab-03/
│
├── app.js
├── books.db
├── books.sql
├── package.json
├── package-lock.json
├── README.md
└── Screenshots/
│   ├── DELETE-SUCCESS.png
│   ├── get-books.png
│   ├── not-found.png
│   ├── order_by.png
│   ├── pagination.png
│   ├── POST-SUCCESS.png
│   ├── price-filter.png
│   ├── put-success.png
│   ├── search_q.png
│   └── validation-error.png
```

## 4. Installation and Execution


### Step 1: Install dependencies

npm install
```

### Step 2: Start the server
npm run dev
```

The server runs at:

http://localhost:3000


## 5. API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Get all books |
| GET | `/books/:bookId` | Get a particular book |
| POST | `/books` | Add a new book |
| PUT | `/books/:bookId` | Update a book |
| DELETE | `/books/:bookId` | Delete a book |

## 6. Query Parameters

### Search Books


GET /books?search_q=atomic


Searches for books using the title.

### Sorting

Ascending order:
GET /books?order_by=price&order=ASC


Descending order:

GET /books?order_by=price&order=DESC

### Pagination

First page:

GET /books?limit=5&offset=0


Second page:

GET /books?limit=5&offset=5
```

### Price Filtering

GET /books?min_price=200&max_price=400
```

Displays books with prices between 200 and 400.

### Combined Filtering

GET /books?search_q=the&min_price=200&max_price=400
```

Searches books by title and filters them by price.

## 7. CRUD Operations

### POST – Add a Book

```json
{
  "title": "The Psychology of Money",
  "author": "Morgan Housel",
  "price": 350,
  "pages": 256
}
```

Expected status: `201 Created`

### PUT – Update a Book

```json
{
  "title": "Rich Dad Poor Dad - Updated",
  "author": "Robert Kiyosaki",
  "price": 400,
  "pages": 336
}
```

Expected status: `200 OK`

### DELETE – Delete a Book

DELETE /books/1


Expected status: `200 OK`

## 8. Validation and Error Handling

The API validates user input and returns appropriate HTTP status codes.

| Status Code | Description |
|---|---|
| 200 | Successful request |
| 201 | Book created successfully |
| 400 | Invalid input or validation error |
| 404 | Book not found |
| 500 | Internal server error |

Examples of validation:
- Title cannot be empty.
- Author cannot be empty.
- Price must be a valid non-negative number.
- Pages must be a positive integer.
- Invalid book IDs are rejected.
- A book that does not exist returns a 404 error.

## 9. Screenshots

The following screenshots demonstrate the API operations and their results.

1. `search.png` – Searching books by title.
2. `sorting.png` – Sorting books by price.
3. `pagination.png` – Displaying books using limit and offset.
4. `price-filter.png` – Filtering books by price range.
5. `post-success.png` – Successfully adding a book.
6. `put-success.png` – Successfully updating a book.
7. `delete-success.png` – Successfully deleting a book.
8. `validation-error.png` – Displaying validation errors.
9. `not-found.png` – Displaying a book-not-found error.

## 10. Learning Outcomes

- Understood REST API principles.
- Learned how to implement GET, POST, PUT and DELETE methods.
- Used query parameters for searching, sorting and filtering.
- Implemented pagination using limit and offset.
- Learned input validation and error handling.
- Connected an Express application with an SQLite database.
- Tested API endpoints using Postman.

## 11. Conclusion

In this lab, I developed a REST API using Node.js, Express.js and SQLite. I implemented CRUD operations and learned how to use query parameters for searching, sorting, filtering and pagination. I also implemented input validation and error handling to make the API more reliable. Finally, I tested the API using Postman and understood how REST APIs work in backend development.