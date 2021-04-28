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
      data = require("../data")
      userData = data.users,
      userPets = data.userPets,
      storeFood = data.storeFood,
      config = require("../config.json"),

// Temporary route faking for debug purposes
router.get("/", async (req, res) => {
  try {
    // Fetch user's favorite pets and limit to the configured setting
    let favorites = req.session.user.favoritePets.slice(0, config.maxFavoritesDisplay);

    for (let i = 0; i < favorites.length; i++)
      favorites[i] = await userPets.get(favorites[i]);

    // Fetch user's inventory and limit to the configured setting
    let inventory = req.session.user.foods,
        inventoryKeys = Object.keys(inventory).slice(0, config.maxInventoryDisplay);

    for (let i = 0; i < inventoryKeys.length; i++)
      inventoryKeys[i] = await storeFood.get(inventoryKeys[i]);

    // Fetch user's friends and limit to the configured settings
    let friends = req.session.user.friends.slice(0, config.maxFriendsDisplay);

    for (let i = 0; i < friends.length; i++)
      friends[i] = await userData.get(friends[i]);

    res.render("mojipets/home", {
      title: "MojiPets",
      favorites: favorites,
      inventory: inventoryKeys,
      friends: friends,
      onload: "start()"
    });
  } catch (e) {  // Some error has occured in the db
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

module.exports = router;
