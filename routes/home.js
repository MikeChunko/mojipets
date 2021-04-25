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
    favorites = [{ emoji: { name: "crab", img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } },
    { name: "crab", emoji: { img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } },
    { name: "crab", emoji: { img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } },
    { name: "crab", emoji: { img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } },
    { name: "crab", emoji: { img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } },
    { name: "crab", emoji: { img: "https://images.emojiterra.com/google/android-10/512px/1f980.png" } }];

    // In reality favorites will contain full StoreFood objects
    inventory = [{ emoji: { name: "pizza", img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } },
    { name: "pizza", emoji: { img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } },
    { name: "pizza", emoji: { img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } },
    { name: "pizza", emoji: { img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } },
    { name: "pizza", emoji: { img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } },
    { name: "pizza", emoji: { img: "https://toppng.com/uploads/preview/favorite-pizza-emoji-1156312532506gn1ygxni.png" } }]

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
