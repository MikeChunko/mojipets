/*
Michael Chunko
Dominick DiMaggio
Marcus Simpkins
Elijah Wendel
CS 546A
I pledge my honor that I have abided by the Stevens Honor System.
*/

// This code is heavily supplemented by lecture 8 code

const path = require("path");

const constructorMethod = (app) => {
    app.use("*", (req, res) => {
        res.sendStatus(404);
    });
}

module.exports = constructorMethod;
