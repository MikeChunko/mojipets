/*
Michael Chunko
Dominick DiMaggio
Marcus Simpkins
Elijah Wendel
CS 546A
I pledge my honor that I have abided by the Stevens Honor System.
*/

// This code is heavily supplemented by lecture 8 code

const express = require("express"),
    app = express(),
    static = express.static(__dirname + "/public"),
    configRoutes = require("./routes"),
    exphbs = require("express-handlebars");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
