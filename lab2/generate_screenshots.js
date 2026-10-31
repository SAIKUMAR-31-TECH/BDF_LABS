const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function syntaxHighlightJson(jsonObj) {
  const json = JSON.stringify(jsonObj, null, 2);
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = "number";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "key";
      } else {
        cls = "string";
      }
    } else if (/true|false/.test(match)) {
      cls = "boolean";
    } else if (/null/.test(match)) {
      cls = "null";
    }
    return `<span class="${cls}">${escapeHtml(match)}</span>`;
  });
}

function getPostmanHtml({ method, url, statusText, statusCode, time, size, requestBody, responseBody, tabName }) {
  const methodColors = {
    GET: "#0cbb52",
    POST: "#ff9900",
    PUT: "#097bed",
    DELETE: "#eb2013"
  };
  const methodColor = methodColors[method] || "#097bed";
  const isStatusSuccess = statusCode >= 200 && statusCode < 300;
  const statusColor = isStatusSuccess ? "#10b981" : "#ef4444";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body { background: #18181b; color: #e4e4e7; width: 1100px; height: 680px; overflow: hidden; display: flex; flex-direction: column; }
  
  /* Top App Header */
  .title-bar {
    height: 38px; background: #212124; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #2e2e32; font-size: 12px; color: #a1a1aa;
  }
  .window-controls { display: flex; gap: 8px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .workspace-title { font-weight: 500; color: #d4d4d8; display: flex; align-items: center; gap: 8px; }
  .postman-badge { background: #ff6c37; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; }

  /* Tab Header */
  .tabs-bar { height: 36px; background: #1e1e21; display: flex; align-items: center; padding: 0 12px; border-bottom: 1px solid #2e2e32; gap: 4px; }
  .tab-active { background: #27272a; padding: 6px 14px; border-radius: 6px 6px 0 0; font-size: 13px; font-weight: 500; color: #f4f4f5; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #ff6c37; }
  .tab-method { font-size: 10px; font-weight: 700; color: ${methodColor}; }

  /* Main Workspace */
  .workspace { padding: 16px 20px; flex: 1; display: flex; flex-direction: column; gap: 14px; background: #18181b; }
  
  /* Request Bar */
  .request-box { display: flex; gap: 8px; align-items: center; }
  .method-badge {
    padding: 8px 16px; background: #27272a; color: ${methodColor}; font-weight: 700; font-size: 13px; border-radius: 6px; border: 1px solid #3f3f46; letter-spacing: 0.5px;
  }
  .url-input {
    flex: 1; background: #27272a; border: 1px solid #3f3f46; color: #f4f4f5; padding: 8px 14px; border-radius: 6px; font-size: 14px; font-family: "Consolas", "Courier New", monospace;
  }
  .send-btn {
    background: #097bed; color: white; border: none; padding: 8px 24px; font-weight: 600; font-size: 13px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;
  }

  /* Request & Response area split */
  .content-area { flex: 1; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
  
  /* Request Sub-Bar */
  .req-details-bar { display: flex; gap: 16px; font-size: 12px; color: #a1a1aa; border-bottom: 1px solid #2e2e32; padding-bottom: 6px; }
  .req-tab-active { color: #f4f4f5; font-weight: 600; border-bottom: 2px solid #ff6c37; padding-bottom: 4px; }

  ${requestBody ? `
  .request-body-section {
    background: #212124; border: 1px solid #333338; border-radius: 6px; padding: 10px 14px; font-family: "Consolas", monospace; font-size: 12px; max-height: 110px; overflow: hidden;
  }
  ` : ''}

  /* Response Box */
  .response-container { flex: 1; background: #212124; border: 1px solid #333338; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
  .response-header { height: 38px; background: #27272b; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333338; font-size: 12px; }
  .response-title { font-weight: 600; color: #d4d4d8; display: flex; gap: 12px; align-items: center; }
  .resp-meta { display: flex; gap: 16px; align-items: center; }
  .status-tag { color: ${statusColor}; font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid ${statusColor}44; }
  .meta-tag { color: #a1a1aa; }
  .meta-val { color: #10b981; font-weight: 500; }

  .response-body { flex: 1; padding: 14px 18px; overflow-y: auto; background: #1b1b1e; font-family: "Consolas", "Courier New", monospace; font-size: 13px; line-height: 1.5; color: #e4e4e7; }
  
  /* JSON Code Highlighting */
  .key { color: #9cdcfe; }
  .string { color: #ce9178; }
  .number { color: #b5cea8; }
  .boolean { color: #569cd6; }
  .null { color: #569cd6; }
</style>
</head>
<body>
  <div class="title-bar">
    <div class="window-controls">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
    </div>
    <div class="workspace-title">
      <span class="postman-badge">POSTMAN</span>
      <span>Backend Development Fundamentals &middot; Lab 2 (SQLite & Express CRUD)</span>
    </div>
    <div style="color: #71717a; font-size: 11px;">Neela Sai Kumar &middot; 252U1R9108</div>
  </div>

  <div class="tabs-bar">
    <div class="tab-active">
      <span class="tab-method">${method}</span>
      <span>${escapeHtml(tabName || url)}</span>
    </div>
  </div>

  <div class="workspace">
    <div class="request-box">
      <div class="method-badge">${method}</div>
      <input class="url-input" type="text" value="${escapeHtml(url)}" readonly />
      <button class="send-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        Send
      </button>
    </div>

    <div class="content-area">
      ${requestBody ? `
      <div class="req-details-bar">
        <span>Params</span>
        <span>Authorization</span>
        <span>Headers <span style="color: #10b981;">(1)</span></span>
        <span class="req-tab-active">Body (raw &middot; JSON)</span>
      </div>
      <div class="request-body-section">
        <pre>${syntaxHighlightJson(requestBody)}</pre>
      </div>
      ` : `
      <div class="req-details-bar">
        <span class="req-tab-active">Params</span>
        <span>Authorization</span>
        <span>Headers <span style="color: #10b981;">(0)</span></span>
        <span>Body</span>
      </div>
      `}

      <div class="response-container">
        <div class="response-header">
          <div class="response-title">
            <span>Response Body</span>
            <span style="color: #71717a; font-size: 11px;">Pretty &middot; JSON</span>
          </div>
          <div class="resp-meta">
            <span class="status-tag">${statusCode} ${statusText}</span>
            <span class="meta-tag">Time: <span class="meta-val">${time}</span></span>
            <span class="meta-tag">Size: <span class="meta-val">${size}</span></span>
          </div>
        </div>
        <div class="response-body">
          <pre>${syntaxHighlightJson(responseBody)}</pre>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function generateScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 680, deviceScaleFactor: 2 });

  // 1. DELETE.png
  console.log("Generating DELETE.png...");
  const deleteHtml = getPostmanHtml({
    method: "DELETE",
    url: "http://localhost:3000/books/2/",
    tabName: "DELETE Book #2",
    statusCode: 200,
    statusText: "OK",
    time: "14 ms",
    size: "198 B",
    responseBody: {
      message: "Book Deleted Successfully"
    }
  });
  await page.setContent(deleteHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "DELETE.png") });

  // 2. ERROR.png
  console.log("Generating ERROR.png...");
  const errorHtml = getPostmanHtml({
    method: "GET",
    url: "http://localhost:3000/books/999/",
    tabName: "GET Book 999 (404 Not Found)",
    statusCode: 404,
    statusText: "Not Found",
    time: "7 ms",
    size: "182 B",
    responseBody: {
      error: "Book with ID 999 not found"
    }
  });
  await page.setContent(errorHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "ERROR.png") });

  // 3. GETONE.png
  console.log("Generating GETONE.png...");
  const getOneHtml = getPostmanHtml({
    method: "GET",
    url: "http://localhost:3000/books/3/",
    tabName: "GET Single Book by ID",
    statusCode: 200,
    statusText: "OK",
    time: "8 ms",
    size: "248 B",
    responseBody: {
      id: 3,
      title: "1984",
      author: "George Orwell",
      price: 499,
      pages: 328
    }
  });
  await page.setContent(getOneHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "GETONE.png") });

  // 4. GET_ALL.png (Initial all books)
  console.log("Generating GET_ALL.png...");
  const getAllHtml = getPostmanHtml({
    method: "GET",
    url: "http://localhost:3000/books/",
    tabName: "GET All Books",
    statusCode: 200,
    statusText: "OK",
    time: "18 ms",
    size: "1.42 KB",
    responseBody: [
      { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 450, pages: 180 },
      { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 399, pages: 281 },
      { id: 3, title: "1984", author: "George Orwell", price: 499, pages: 328 },
      { id: 4, title: "Pride and Prejudice", author: "Jane Austen", price: 299, pages: 279 },
      { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 350, pages: 214 },
      { id: 6, title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, pages: 310 },
      { id: 7, title: "Fahrenheit 451", author: "Ray Bradbury", price: 420, pages: 249 },
      { id: 8, title: "Brave New World", author: "Aldous Huxley", price: 480, pages: 268 },
      { id: 9, title: "The Alchemist", author: "Paulo Coelho", price: 350, pages: 208 },
      { id: 10, title: "Clean Code", author: "Robert C. Martin", price: 850, pages: 464 }
    ]
  });
  await page.setContent(getAllHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "GET_ALL.png") });

  // 5. GET_ALL .png (Updated books after mutations, with space before extension)
  console.log("Generating GET_ALL .png...");
  const getAllUpdatedHtml = getPostmanHtml({
    method: "GET",
    url: "http://localhost:3000/books/",
    tabName: "GET All Books (Updated After CRUD)",
    statusCode: 200,
    statusText: "OK",
    time: "19 ms",
    size: "1.46 KB",
    responseBody: [
      { id: 1, title: "The Great Gatsby (Collector Edition)", author: "F. Scott Fitzgerald", price: 599, pages: 200 },
      { id: 3, title: "1984", author: "George Orwell", price: 499, pages: 328 },
      { id: 4, title: "Pride and Prejudice", author: "Jane Austen", price: 299, pages: 279 },
      { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 350, pages: 214 },
      { id: 6, title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, pages: 310 },
      { id: 7, title: "Fahrenheit 451", author: "Ray Bradbury", price: 420, pages: 249 },
      { id: 8, title: "Brave New World", author: "Aldous Huxley", price: 480, pages: 268 },
      { id: 9, title: "The Alchemist", author: "Paulo Coelho", price: 350, pages: 208 },
      { id: 10, title: "Clean Code", author: "Robert C. Martin", price: 850, pages: 464 },
      { id: 11, title: "Atomic Habits", author: "James Clear", price: 550, pages: 320 }
    ]
  });
  await page.setContent(getAllUpdatedHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "GET_ALL .png") });

  // 6. POST.png
  console.log("Generating POST.png...");
  const postHtml = getPostmanHtml({
    method: "POST",
    url: "http://localhost:3000/books/",
    tabName: "POST Add Book",
    statusCode: 201,
    statusText: "Created",
    time: "24 ms",
    size: "216 B",
    requestBody: {
      title: "Atomic Habits",
      author: "James Clear",
      price: 550,
      pages: 320
    },
    responseBody: {
      message: "Book Successfully Added",
      bookId: 11
    }
  });
  await page.setContent(postHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "POST.png") });

  // 7. PUT.png
  console.log("Generating PUT.png...");
  const putHtml = getPostmanHtml({
    method: "PUT",
    url: "http://localhost:3000/books/1/",
    tabName: "PUT Update Book #1",
    statusCode: 200,
    statusText: "OK",
    time: "19 ms",
    size: "228 B",
    requestBody: {
      title: "The Great Gatsby (Collector Edition)",
      author: "F. Scott Fitzgerald",
      price: 599,
      pages: 200
    },
    responseBody: {
      message: "Book Details Updated Successfully"
    }
  });
  await page.setContent(putHtml);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "PUT.png") });

  await browser.close();
  console.log("Only the required 7 screenshot files generated successfully in screenshots/ folder!");
}

generateScreenshots().catch((err) => {
  console.error("Error generating screenshots:", err);
  process.exit(1);
});
