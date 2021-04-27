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

// Temporary route faking for debug purposes
router.get("/", async (req, res) => {
  let favorites, inventory, friends;

  // TODO: Call the appropriate db methods for each

  // In reality favorites will contain full UserPet objects
  favorites = [{ emoji: { name: "crab", img: "public/resources/pets/cat.svg" } },
               { emoji: { name: "cat", img: "public/resources/pets/crab.svg" } },
               { emoji: { name: "cow", img: "public/resources/pets/cow.svg" } },
               { emoji: { name: "ant", img: "public/resources/pets/ant.svg" } },
               { emoji: { name: "caterpillar", img: "public/resources/pets/caterpillar.svg" } },
               { emoji: { name: "panda", img: "public/resources/pets/panda.svg" } }];

  // In reality favorites will contain full StoreFood objects
  inventory = [{ emoji: { name: "pizza", img: "public/resources/food/pizza.svg" } },
               { emoji: {name: "bagel", img: "public/resources/food/bagel.svg" } },
               { emoji: {name: "falafel", img: "public/resources/food/falafel.svg" } },
               { emoji: {name: "mango", img: "public/resources/food/mango.svg" } },
               { emoji: {name: "sushi", img: "public/resources/food/sushi.svg" } },
               { emoji: {name: "melon", img: "public/resources/food/melon.svg" } }]

  // In reality friends will contains user objects
  // I think only _id and displayname are needed though
  friends = [{displayName: "babbis"}, {displayName: "babbis"}, {displayName: "babbis"}, {displayName: "babbis"}];

  // Trim
  favorites = favorites.slice(0, 6);
  inventory = inventory.slice(0, 6);
  friends = friends.slice(0, 20);

  res.render("mojipets/home", {
    title: "MojiPets",
    favorites: favorites,
    inventory: inventory,
    friends: friends,
    onload: "start()"
  });
});

module.exports = router;
