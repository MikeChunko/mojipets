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
      userPets = data.userPets,
      storeFood = data.storeFood,
      config = require("../config.json"),
      maxFavoritesDisplay = config.maxFavoritePetsDisplay,
      maxInventoryDisplay = config.maxInventoryDisplay;

// Temporary route faking for debug purposes
router.get("/", async (req, res) => {
  // Fetch user's favorite pets and limit to the configured setting
  let favorites = req.session.user.favoritePets.slice(0, maxFavoritesDisplay);

  for (let i = 0; i < favorites.length; i++)
    favorites[i] = await userPets.get(favorites[i]);

  // Fetch user's inventory and limit to the configured setting
  let inventory = req.session.user.foods,
      inventoryKeys = Object.keys(inventory).slice(0, maxInventoryDisplay);

  for (let i = 0; i < inventoryKeys.length; i++)
    inventoryKeys[i] = await storeFood.get(inventoryKeys[i]);

  // In reality friends will contains user objects
  // I think only _id and displayname are needed though
  let friends = [{displayName: "babbis"}, {displayName: "babbis"}, {displayName: "babbis"}, {displayName: "babbis"}];
  friends = friends.slice(0, 20);

  res.render("mojipets/home", {
    title: "MojiPets",
    favorites: favorites,
    inventory: inventoryKeys,
    friends: friends,
    onload: "start()"
  });
});

module.exports = router;
