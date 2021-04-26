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
      path = require("path");;

router.get("/", async (req, res) => {
  // Logged-in users should never see the login screen
  if (req.session.user)
    return res.redirect("/home");

  res.sendFile(path.resolve("static/login.html"));
});

router.post("/login", async (req, res) => {
  // ! Fake a user login for now
  req.session.user = {debug: "debug"};

  console.log(req.body.usernameInput, req.body.passwordInput);  // ! Debug to verify that form is working correctly
  return res.redirect("/home");
})

module.exports = router;
