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
      session = require("express-session"),
      static = express.static(__dirname + "/public"),
      configRoutes = require("./routes"),
      exphbs = require("express-handlebars");

app.use(session({
  name: "MojiPets",
  secret: "boy it sure would be unfortunate if this string was leaked",
  resave: false,
  saveUninitialized: true
}));

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Authentication middleware
app.use("/", (req, res, next) => {
  // Fall through
  if (req.originalUrl == "/" || req.originalUrl.indexOf("/signup") == 0 ||
      req.originalUrl.indexOf("/login") == 0 || req.session.user)
    return next();

  // User failed authentication - redirect to login page
  return res.status(403).redirect("/");
})

configRoutes(app);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
