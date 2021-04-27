/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const express = require("express"),
      router = express.Router(),
      bcrypt = require("bcrypt"),
      config = require("../config.json"),
      saltRounds = config.saltRounds,
      data = require("../data"),
      userData = data.users;


router.get("/", async (req, res) => {
  // Logged-in users should never see the login screen
  if (req.session.user)
    return res.redirect("/home");

  res.render("mojipets/login", {
    title: "MojiPets",
    css: "/public/site.css",
    error: ""
  });
});

router.post("/login", async (req, res) => {
  // Input checking
  const uname = req.body.usernameInput,
        password = req.body.passwordInput;

  if (!uname || uname.trim().length == 0)
    return res.status(400).render("mojipets/login", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Please enter a username"
    });

  if (!password || password.trim().length == 0 || password.length < 8)
    return res.status(400).render("mojipets/login", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Please enter a password at least 8 characters long"
    });

  const users = await userData.getAllUsers();

  // Fetch our desired user
  const userObj = users.find((user, i) => {
    if (user.username == uname)
      return user;
  });

  // User with give username does not exist
  if (typeof (userObj) == "undefined")
    return res.status(401).render("mojipets/login", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Username and/or password is incorrect"
    });

  const { passwordhash, ...user } = userObj,
        match = await bcrypt.compare(password, passwordhash);

  if (!match)
    return res.status(401).render("mojipets/login", {
      title: "MojiPets",
      css: "/public/site.css",
      error: "Username and/or password is incorrect"
    });

  // Successfully log the user in
  req.session.user = user;

  return res.redirect("/home");
})

module.exports = router;
