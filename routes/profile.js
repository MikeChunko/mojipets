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

  const dummy_username = "TestUser";
  // TODO: Fill with real data
  res.render("mojipets/profile", {
    title: dummy_username + "'s Profile",
    display_name: dummy_username,
    profile_pic: "https://avatars.githubusercontent.com/u/677777?v=4",
    join_date: "4/26/2021",
    fav_pets: [ 0, 0, 0, 0, 0, 0 ], // Limit to 6, would need to edit handlebars to get emoji pics
    css: "/public/site.css"
  });
});

module.exports = router;
