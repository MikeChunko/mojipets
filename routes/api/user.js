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
      data = require("../../data");

/** 
 * helper functions to remove sensitive fields from objects on return 
 **/
const protect = {
  user: {
    // user is logged in, show private info
    showSensitive: (user) => {
      delete user.passwordHash
      return user
    },

    // user is not logged in, only show public info
    hideSensitive: (user) => {
      delete user.passwordHash
      delete user.friends
      delete user.pets
      delete foods

      // remaining fields: username, displayname, credits, favoritePets
      return user
    }
  },
  pet: {
    // pet owner is logged in, show private info
    showSensitive: (pet) => {
      delete pet.interactions
      return pet
    },

    // pet owner is not logged in, only show public info
    hideSensitive: (pet) => {
      delete pet.interacitions
      delete pet.happiness
      delete pet.health

      // remaining fields: name, birthday, emoji
      return pet
    }
  }
}

// TODO: 🐛 check for bugs
router.get('/:id', async (req, res) => {
  // Error checking
  let id = req.params.id,
      user = null;

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  try { user = await data.users.get(id) }
  catch (e) { return res.sendStatus(500).json({ error: e.toString() }) }

  if (req.session.user && req.session.user._id === id)
    res.json(protect.user.showSensitive(user))
  else res.json(protect.user.hideSensitive(user))
})

// TODO: 🐛 check for bugs
router.get('/:id/pets', async (req, res) => {
  // Error checking
  let id = req.params.id,
      alive = req.body.alive;

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  // api doesn't care abt alive/dead
  if (alive == null || alive == undefined) { 
    let user = null
    try { user = await data.users.get(id) }
    catch (e) { return res.sendStatus(500).json({ error: e.toString() }) }

    if (req.session.user && req.session.user._id === id)
      res.json(user.pets.map(protect.pet.showSensitive))
    else res.json(user.pets.map(protect.pet.hideSensitive))

  // api should try to get only alive pets if alive === true
  } else { 
    let pets = []
    try {
      pets = alive
        ? await data.users.getLivingPets(id)
        : await data.users.getDeadPets(id)
    }
    catch (e) { return res.sendStatus(500).json({ error: e.toString() }) }

    if (req.session.user && req.session.user._id === id)
      res.json(pets.map(protect.pet.showSensitive))
    else res.json(pets.map(protect.pet.hideSensitive))
  }
})

module.exports = router
