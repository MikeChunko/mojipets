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
  xss = require("xss"),
  data = require("../data"),
  userData = data.users,
  config = require("../config.json"),
  { dateToMMDDYY } = require("../util"),
  cloneDeep = require("lodash.clonedeep");

router.get("/:uname", async (req, res) => {
  let uname = xss(req.params.uname);

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
        error_msg: `The user ${uname} does not exist`,
        css: "/public/site.css"
      });
    }

    // Check if the inciting user has permission to access this profile

    // Nobody can view
    if (userObj.privacy == 2)
      return res.render("mojipets/profile", {
        title: uname + "'s Profile",
        username: uname,
        error: true,
        error_msg: `You do not have permission to view this user's profile`,
        css: "/public/site.css"
      });

    // Friends only
    if (userObj.privacy == 1) {
      if (!req.session.user)
        return res.render("mojipets/profile", {
          title: uname + "'s Profile",
          username: uname,
          error: true,
          error_msg: `You do not have permission to view this user's profile`,
          css: "/public/site.css"
        });

        if (!req.session.user.friends.find((friend, i) => {
          if (friend == userObj._id)
            return friend;
        }))
          return res.render("mojipets/profile", {
            title: uname + "'s Profile",
            username: uname,
            error: true,
            error_msg: `You do not have permission to view this user's profile`,
            css: "/public/site.css"
          });
    }

    pets = cloneDeep(userObj.favoritePets);

    // Map favorite pet IDs to the full pet
    for (let i = 0; i < pets.length; i++) {
      pets[i] = userObj.pets.find((pet, j) => {
        if (pet._id.equals(pets[i]))
          return pet;
      });
    }

    res.render("mojipets/profile", {
      title: userObj.username + "'s Profile",
      uname: userObj.username,
      display_name: userObj.displayname,
      profile_pic: userObj.pfp.img,
      join_date: dateToMMDDYY(userObj.joinDate),
      last_online: dateToMMDDYY(userObj.lastLogin),
      fav_pets: pets,
      css: "/public/site.css"
    });
  } catch (e) {  // Some db error has occurred
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/:uname/all", async (req, res) => {
  let uname = xss(req.params.uname);

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
        error_msg: `The user ${uname} does not exist`,
        css: "/public/site.css"
      });
    }

    let pets = await userPets.getPetsFromUser(userObj._id);

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
      join_date: dateToMMDDYY(userObj.joinDate),
      last_online: dateToMMDDYY(userObj.lastLogin),
      pets: pets,
      css: "/public/site.css"
    });
  } catch (e) {  // Some db error has occurred
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

router.get("/:uname/most", async (req, res) => {
  let uname = xss(req.params.uname);

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
      return res.render("mojipets/profile_most", {
        title: uname + "'s Profile",
        username: uname,
        error: true,
        error_msg: `The user ${uname} does not exist`,
        css: "/public/site.css"
      });
    }

    // Arbitrarily limit to 6
    let pets = (await userPets.getPetsFromUser(userObj._id)).slice(0, 6);

    // Map happiness, health, agel and total interactions
    for (let i = 0; i < pets.length; i++) {
      pets[i].happiness = await userPets.getHappiness(pets[i]._id);
      pets[i].status = await userPets.getStatus(pets[i]._id);
      pets[i].age = await userPets.getAge(pets[i]._id);
      pets[i].interactions = await userPets.getTotalInteractions(pets[i]._id)
    }

    // Sort based on interactions
    pets.sort((a, b) => {
      return b.interactions - a.interactions;
    });

    res.render("mojipets/profile_most", {
      title: userObj.username + "'s Profile",
      uname: userObj.username,
      display_name: userObj.displayname,
      profile_pic: userObj.pfp.img,
      join_date: dateToMMDDYY(userObj.joinDate),
      last_online: dateToMMDDYY(userObj.lastLogin),
      most_pets: pets,
      css: "/public/site.css"
    });
  } catch (e) {  // Some db error has occurred
    console.log(e);
    res.status(500).sendFile(path.resolve("static/error_db.html"));
  }
});

module.exports = router;
