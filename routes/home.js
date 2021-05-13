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
      userPets = data.userPets,
      storeFood = data.storeFood,
      cloneDeep = require("lodash.clonedeep"),
      { protect } = require("../util");

router.get("/", async (req, res) => {
  try {
    // Make sure our version of the user is up-to-daate

    // Fetch user's favorite pets
    let favorites = cloneDeep(req.session.user.favoritePets)

    for (let i = 0; i < favorites.length; i++)
      favorites[i] = await userPets.get(favorites[i]);

    // Fetch user's inventory
    // For some reason req.session.user inventory refuses to update properly
    let inventory = cloneDeep((await userData.get(req.session.user._id)).foods),
        inventoryKeys = Object.keys(inventory);

    for (let i = 0; i < inventoryKeys.length; i++) {
      inventoryKeys[i] = { quantity: inventory[inventoryKeys[i]], ...await storeFood.get(inventoryKeys[i]) };

      // Handle "infinite" quantities
      if (inventoryKeys[i].quantity == -1)
        inventoryKeys[i].quantity = "∞";
    }

    // Fetch user's friends
    let friends = cloneDeep(req.session.user.friends);

    for (let i = 0; i < friends.length; i++)
      friends[i] = await userData.get(friends[i]);

    // Harcoding since we only have a single toy for now
    toys = [{
      _id: "-1",
      quantity: "∞",
      emoji: {
        name: "basketball",
        img: "/public/resources/toys/basketball.svg"
      }
    }]

    res.render("mojipets/home", {
      title: "MojiPets",
      favorites: favorites,
      inventory: inventoryKeys,
      toys: toys,
      friends: friends,
      money: req.session.user.credits,
      onload: "start()"
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/pets", async (req, res) => {
  try {
    let pets = cloneDeep(req.session.user.pets);

    // Map happiness, health, age, and favorite food
    for (let i = 0; i < pets.length; i++) {
      console.log(pets[i]);
      pets[i].happiness = await userPets.getHappiness(pets[i]._id);
      pets[i].status = await userPets.getStatus(pets[i]._id);
      pets[i].age = await userPets.getAge(pets[i]._id);
      pets[i].food = (await storeFood.get(pets[i].favoriteFood)).emoji.codepoint;
    }

    res.render("mojipets/home_partials/pets", {
      layout: false,
      pets: pets,
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e)
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/pets/:id", async (req, res) => {
  if (!req.params.id || typeof(req.params.id) != "string" || xss(req.params.id).trim().length == 0)
    return res.sendStatus(400);

  // Find the full info for the desired pet
  const sanitized_id = xss(req.params.id);
  let pet = req.session.user.pets.find((pet, i) => {
    if (pet._id == sanitized_id)
      return pet;
  });

  pet = cloneDeep(pet)

  // Either the pet doesn't exist or doesn't belong to this user
  if (!pet)
    return res.sendStatus(403);

  try {
    // Map happiness, health, age, total interactions, and favorite food
    pet.happiness = await userPets.getHappiness(pet._id);
    pet.status = await userPets.getStatus(pet._id);
    pet.age = await userPets.getAge(pet._id);
    pet.interactions = await userPets.getTotalInteractions(pet._id);
    pet.favoriteFood = await storeFood.get(pet.favoriteFood);

    // Fetch and scale percentages
    pet.happiness_percent = 100 * (await userPets.getHappinessAsNumber(pet._id));
    pet.status_percent = 100 * (await userPets.getHealthAsNumber(pet._id));

    // Map precents to classes (used for coloring the bar)
    let happy_class = "";
    switch (true) {
      case (pet.happiness_percent >= 66.7):
        happy_class = "health_high";
        break;
      case (pet.happines_percent >= 33.4):
        happy_class = "health-med";
        break;
      default:
        happy_class = "health-low";
    }

    let status_class = "";
    switch (true) {
      case (pet.status_percent >= 66.7):
        status_class = "health_high";
        break;
      case (pet.status_percent >= 33.4):
        status_class = "health-med";
        break;
      default:
        status_class = "health-low";
    }

    res.render("mojipets/home_partials/pet", {
      layout: false,
      pet: pet,
      happy_class: happy_class,
      status_class: status_class
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e)
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/graveyard", async (req, res) => {
  try {
    let pets = await userData.getDeadPets(req.session.user._id);

    // Map happiness, health, and age
    for (let i = 0; i < pets.length; i++) {
      pets[i].happiness = await userPets.getHappiness(pets[i]._id.toString());
      pets[i].status = await userPets.getStatus(pets[i]._id.toString());
      pets[i].age = await userPets.getAge(pets[i]._id.toString());
      pets[i].food = (await storeFood.get(pets[i].favoriteFood)).emoji.codepoint;
    }

    res.render("mojipets/home_partials/graveyard", {
      layout: false,
      pets: pets,
    });
  } catch (e) {  // Some error has occured in the db
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/favorite-pets", async (req, res) => {
  try {
    let favorites = cloneDeep(req.session.user.favoritePets);

    for (let i = 0; i < favorites.length; i++)
      favorites[i] = await userPets.get(favorites[i]);

    res.render("mojipets/home_partials/favorites", {
      layout: false,
      favorites: favorites
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/friends", async (req, res) => {
  try {
    // Fetch user's friends
    let friends = cloneDeep(req.session.user.friends);

    for (let i = 0; i < friends.length; i++)
      friends[i] = await userData.get(friends[i]);

    res.render("mojipets/home_partials/friends", {
      layout: false,
      friends: friends
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/inventory", async (req, res) => {
  try {
    // Fetch user's inventory
    // For some reason req.session.user inventory refuses to update properly
    let inventory = cloneDeep((await userData.get(req.session.user._id)).foods),
        inventoryKeys = Object.keys(inventory);

    for (let i = 0; i < inventoryKeys.length; i++) {
      inventoryKeys[i] = { quantity: inventory[inventoryKeys[i]], ...await storeFood.get(inventoryKeys[i]) };

      // Handle "infinite" quantities
      if (inventoryKeys[i].quantity == -1)
        inventoryKeys[i].quantity = "∞";
    }

    res.render("mojipets/home_partials/inventory", {
      layout: false,
      inventory: inventoryKeys
    });
  } catch (e) {  // Some error has occured in the db
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

module.exports = router;
