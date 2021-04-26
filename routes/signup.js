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
      path = require("path");

// Temporary route faking for debug purposes
router.get("/", async (req, res) => {
  // Logged-in users should never see the signup screen
  if (req.session.user)
    return res.redirect("/home");

  res.sendFile(path.resolve("static/signup.html"));
});

module.exports = router;
