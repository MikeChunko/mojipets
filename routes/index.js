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
      signupRoutes = require("./signup"),
      logoutRoutes = require("./logout");
      profileRoutes = require("./profile");
      shopRoutes = require("./shop"),
      apiRoutes = require("./api"),
      path = require("path");

const constructorMethod = (app) => {
  app.use("/", loginRoutes);
  app.use("/signup", signupRoutes);
  app.use("/home", homeRoutes);
  app.use("/logout", logoutRoutes);
  app.use("/profile", profileRoutes);
  app.use("/shop", shopRoutes);
  app.use("/api", apiRoutes);

  app.use("*", (req, res) => {
    res.status(404).sendFile(path.resolve("static/error.html"));
  });
}

module.exports = constructorMethod;
