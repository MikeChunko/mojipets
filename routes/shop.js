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
      storePets = data.storePets,
      storeFood = data.storeFood;

router.get("/", async (req, res) => {
  // ! Debug so I don't need to log in each time
  let credits;
  try {
    credits = req.session.user.credits;
  } catch (e) {
    credits = 1000;
  }

  try {
    const shopPets = await storePets.getAll(),
          shopFood = await storeFood.getAll();

    res.render("mojipets/shop", {
      title: "MojiPets",
      shopPets: shopPets,
      shopFood: shopFood,
      money: credits,
      css: "/public/site.css",
      postjs: "/public/shop.js"
    });
} catch (e) {  // Some error has occured in the db
  res.status(500).sendFile(path.resolve("static/error_db.html"));
}
});

module.exports = router;
