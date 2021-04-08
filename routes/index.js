/*
Michael Chunko
Dominick DiMaggio
Marcus Simpkins
Elijah Wendel
CS 546A
I pledge my honor that I have abided by the Stevens Honor System.
*/

const mainRoutes = require("./main"),
    homeRoutes = require("./home"),
    path = require("path");

const constructorMethod = (app) => {
    app.use("/", mainRoutes);

    app.use("/home", homeRoutes);

    app.use("*", (req, res) => {
        res.sendStatus(404);
    });
}

module.exports = constructorMethod;
