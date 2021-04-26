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
      data = require("../data"),
      userData = data.users;

router.get("/", async (req, res) => {
  // Logged-in users should never see the signup screen
  if (req.session.user)
    return res.redirect("/home");

  return res.render("mojipets/signup", {
    title: "MojiPets",
    css: "/public/site.css",
    error: ""
  })
});

router.post("/", async (req, res) => {
  res.sendStatus(404);
})

module.exports = router;
