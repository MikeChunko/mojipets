/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const express = require("express"),
      router = express.Router();

router.get("/", (req, res) => {
  // TODO: Fill with real data
  res.render("mojipets/shop", {
    title: "Shop",
    money: 4,
    css: "/public/site.css",
    postjs: "/public/shop.js"
  });
});

module.exports = router;
