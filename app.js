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
      exphbs = require("express-handlebars"),
      data = require("./data"),
      userData = data.users;

app.use(session({
  name: "MojiPets",
  secret: "boy it sure would be unfortunate if this string was leaked",
  resave: false,
  saveUninitialized: true
}));

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({
  helpers: {
    gt: function(a,b) { return (a > b) }
  },
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Authentication middleware
app.use("/", (req, res, next) => {
  // Fall through
  if (req.originalUrl == "/" || req.originalUrl.indexOf("/signup") == 0 ||
      req.originalUrl.indexOf("/login") == 0 ||
      req.originalUrl.indexOf("/profile") == 0 ||
      req.originalUrl.startsWith('/api') || req.session.user)
    return next();

  // User failed authentication - redirect to login page
  return res.status(403).redirect("/");
});

// lastLogin middleware
app.use("/", async (req, res, next) => {
  if (req.session.user)
    req.session.user.lastLogin = await userData.updateLoginTime(req.session.user._id).lastLogin;

  return next();
});

// Death notification middleware
app.use("/", async (req, res, next) => {
  // This should only be done if the user is logged in
  if (req.session.user) {
    let deaths = await userData.checkDeaths(req.session.user._id);

    // No deaths have happened
    if (deaths.length == 0)
      return next();

    req.session.user = await userData.get(req.session.user._id);

     // Map happiness, health, and age
    for (let i = 0; i < deaths.length; i++) {
      deaths[i].happiness = await userPets.getHappiness(deaths[i]._id.toString());
      deaths[i].status = await userPets.getStatus(deaths[i]._id.toString());
      deaths[i].age = await userPets.getAge(deaths[i]._id.toString());
    }

    // Render the death page
    return res.render("mojipets/deaths", {
      title: "MojiPets",
      deaths: deaths,
      css: "/public/site.css"
    })
  }

  return next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
