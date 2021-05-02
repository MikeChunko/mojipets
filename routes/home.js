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
      cloneDeep = require("lodash.clonedeep");

router.get("/", async (req, res) => {
  try {
    // Fetch user's favorite pets and limit to the configured setting
    let favorites = req.session.user.favoritePets.slice(0, config.maxFavoritesDisplay);

    for (let i = 0; i < favorites.length; i++)
      favorites[i] = await userPets.get(favorites[i]);

    // Fetch user's inventory
    let inventory = cloneDeep(req.session.user.foods),
        inventoryKeys = Object.keys(inventory);

    for (let i = 0; i < inventoryKeys.length; i++)
      inventoryKeys[i] = { quantity: inventory[inventoryKeys[i]], ...await storeFood.get(inventoryKeys[i]) };

    // Fetch user's friends and limit to the configured settings
    let friends = cloneDeep(req.session.user.friends);

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

router.get("/pets", async (req, res) => {
  try {
    let pets = cloneDeep(req.session.user.pets);

    // Map happiness, health, and age
    for (let i = 0; i < pets.length; i++) {
      pets[i].happiness = await userPets.getHappiness(pets[i]._id);
      pets[i].status = await userPets.getStatus(pets[i]._id);
      pets[i].age = await userPets.getAge(pets[i]._id);
    }

    res.render("mojipets/home_partials/pets", {
      layout: false,
      pets: pets,
    });
  } catch (e) {  // Some error has occured in the db
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/pets/:id", async (req, res) => {
  res.render("mojipets/home_partials/pet", {
    layout: false,
  });
});

module.exports = router;
