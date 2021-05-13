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
  xss = require("xss"),
  data = require("../data"),
  userData = data.users,
  config = require("../config.json"),
  cloneDeep = require("lodash.clonedeep");

router.get("/", async (req, res) => {
  res.render("mojipets/settings", {
    title: "MojiPets",
    ...req.session.user,
    css: "public/site.css"
  })
})

module.exports = router;
