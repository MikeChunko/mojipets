/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const loginRoutes = require("./login"),
      homeRoutes = require("./home"),
      signupRoutes = require("./signup");

const constructorMethod = (app) => {
  app.use("/", loginRoutes);
  app.use("/signup", signupRoutes);
  app.use("/home", homeRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
}

module.exports = constructorMethod;
