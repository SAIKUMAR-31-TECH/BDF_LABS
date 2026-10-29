const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (request, response) => {
    response.status(200).send("Welcome to my Lab 1 server!");
});

app.get("/about", (request, response) => {
    response.status(200).json({
        name: "NEELA SAI KUMAR",
        section: "CSE-GEN AI -2B"
    });
});

app.get("/time", (request, response) => {
    response.status(200).json({
        currentDateTime: new Date()
    });
});

app.use((request, response) => {
    response.status(404).send("404 - Page Not Found");
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
