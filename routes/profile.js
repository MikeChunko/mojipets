/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const { userPets } = require("../data");

const express = require("express"),
  router = express.Router(),
  data = require("../data"),
  userData = data.users,
  config = require("../config.json");

router.get("/:uname", async (req, res) => {
  let uname = req.params.uname;

  if (!uname || typeof (uname) != "string")
    res.sendStatus(404);

  uname = uname.toLowerCase();

  try {
    const users = await userData.getAllUsers();

    // Search for our desired user
    const userObj = users.find((user, i) => {
      if (user.username.toLowerCase() == uname)
        return user;
    });

    // User with the given username does not exist
    if (typeof (userObj) == "undefined") {
      return res.render("mojipets/profile", {
        title: uname + "'s Profile",
        username: uname,
        error: true,
        css: "/public/site.css"
      });
    }

    pets = userObj.favoritePets.slice(0, config.maxFavoritePetsDisplay);

    // Map favorite pet IDs to the full pet
    for (let i = 0; i < pets.length; i++) {
      pets[i] = userObj.pets.find((pet, i) => {
        if (pet._id.equals(pets[i]))
          return pet;
      });
    }

    res.render("mojipets/profile", {
      title: userObj.username + "'s Profile",
      uname: userObj.username,
      display_name: userObj.displayname,
      profile_pic: userObj.pfp.img,
      join_date: `${userObj.joinDate.getUTCMonth() + 1}/${userObj.joinDate.getUTCDate()}/${userObj.joinDate.getYear() - 100}`,
      fav_pets: pets,
      max_pets: config.maxFavoritePetsDisplay,
      css: "/public/site.css"
    });
  } catch (e) {  // Some db error has occurred
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/:uname/all", async (req, res) => {
  let uname = req.params.uname;

  if (!uname || typeof (uname) != "string")
    res.sendStatus(404);

  uname = uname.toLowerCase();

  try {
    const users = await userData.getAllUsers();

    // Search for our desired user
    const userObj = users.find((user, i) => {
      if (user.username.toLowerCase() == uname)
        return user;
    });

    // User with the given username does not exist
    if (typeof (userObj) == "undefined") {
      return res.render("mojipets/profile_all", {
        title: uname + "'s Profile",
        username: uname,
        error: true,
        css: "/public/site.css"
      });
    }

    let pets = (await userPets.getPetsFromUser(userObj._id));

    // Map happiness, health, and age
    for (let i = 0; i < pets.length; i++) {
      pets[i].happiness = await userPets.getHappiness(pets[i]._id);
      pets[i].status = await userPets.getStatus(pets[i]._id);
      pets[i].age = await userPets.getAge(pets[i]._id);
    }

    res.render("mojipets/profile_all", {
      title: userObj.username + "'s Profile",
      uname: userObj.username,
      display_name: userObj.displayname,
      profile_pic: userObj.pfp.img,
      join_date: `${userObj.joinDate.getUTCMonth() + 1}/${userObj.joinDate.getUTCDate()}/${userObj.joinDate.getYear() - 100}`,
      pets: pets,
      css: "/public/site.css"
    });
  } catch (e) {  // Some db error has occurred
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

module.exports = router;
