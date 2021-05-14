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
    privacy0: req.session.user.privacy == 0 ? "checked" : "",
    privacy1: req.session.user.privacy == 1 ? "checked" : "",
    privacy2: req.session.user.privacy == 2 ? "checked" : "",
    css: "public/site.css",
    postjs: "/public/settings.js"
  })
})

module.exports = router;
