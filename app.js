const express = require("express");
const app = express();

app.get("/", (request, response) => {
    response.status(200).send("Welcome to my Lab 1 server!");
});

module.exports = app;
