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

router.get("/", (req, res) => {
  // Destroy session info
  req.session.destroy();

  res.sendFile(path.resolve("static/logout.html"));
});

module.exports = router;
