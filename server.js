const express = require("express");

const app = express();
const PORT = 3000;

// GET /
app.get("/", (request, response) => {
    response.status(200).send("Welcome to my Lab 1 server!");
});

// GET /about
app.get("/about", (request, response) => {
    response.status(200).json({
        name: "NEELA SAI KUMAR",
        section: "CSE-GEN AI -2B"
    });
});

// GET /time
app.get("/time", (request, response) => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    response.status(200).json({
        date: formattedDate,
        currentDateTime: today
    });
});

// Handle unknown routes
app.use((request, response) => {
    response.status(404).send("404 - Page Not Found");
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Express server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
