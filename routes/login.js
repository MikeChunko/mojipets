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
  res.sendFile(path.resolve("static/login.html"));
});

module.exports = router;
