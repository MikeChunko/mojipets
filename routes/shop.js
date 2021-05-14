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
      storeFood = data.storeFood,
      storeToys = data.storeToys;

async function handleRequest(req, res) {
  let initial_state = 0;
  if(req.body.shopType)
    switch (req.body.shopType) {
      case "0":
        initial_state = 0;
        break
      case "1":
        initial_state = 1;
        break
      case "2": 
        initial_state = 2;
        break;
    }

  try {
    let shopPets = await storePets.getAll(),
        shopFood = await storeFood.getAll(),
        shopToys = await storeToys.getAll();
    
    // Remove our infinite food source from the shop
    const mob = shopFood.find((food, i) => {
      if (food.emoji.name == "meat on bone")
        return food;
    });

    if (mob)
      shopFood.splice(shopFood.indexOf(mob), 1);

    res.render("mojipets/shop", {
      title: "MojiPets",
      shopPets: shopPets,
      shopFood: shopFood,
      shopToys: shopToys,
      money: req.session.user.credits,
      initial_state: initial_state,
      css: "/public/site.css",
      postjs: "/public/shop.js"
    });
  } catch (e) {  // Some error has occured in the db
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
}

router.post("/", async (req, res) => {
  handleRequest(req, res);
});

router.get("/", async (req, res) => {
  handleRequest(req, res);
});

module.exports = router;
