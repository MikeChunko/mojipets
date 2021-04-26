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
      path = require("path"),
      bcrypt = require("bcrypt"),
      settings = require("../config.json"),
      saltRounds = settings.saltRounds,
      data = require("../data"),
      userData = data.users;


router.get("/", async (req, res) => {
  // Logged-in users should never see the login screen
  if (req.session.user)
    return res.redirect("/home");

  res.sendFile(path.resolve("static/login.html"));
});

router.post("/login", async (req, res) => {
  // Input checking
  const uname = req.body.usernameInput,
        password = req.body.passwordInput;

  if (!uname || uname.trim().length == 0) {
    console.log("bad uname");
    return res.sendStatus(401);
  }

  if (!password || password.trim().length == 0 || password.length < 8) {
    console.log("bad pword");
    return res.sendStatus(401);
  }

  const users = await userData.getAllUsers();

  // Fetch our desired user
  const userObj = users.find((user, i) => {
    if (user.username == uname)
      return user;
  });

  // User with give username does not exist
  if (typeof (userObj) == "undefined") {
    console.log("uname doesnt exist");
    return res.sendStatus(401)
  }

  const { passwordhash, ...user } = userObj; console.log(password, passwordhash)
        let match = await bcrypt.compare(password, passwordhash);

  if (!match) {
    console.log("incorrect pword");
    return res.sendStatus(401);
  }

  // Successfully log the user in
  req.session.user = user;

  return res.redirect("/home");
})

module.exports = router;
