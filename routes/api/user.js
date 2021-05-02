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
      delete user.passwordhash
      return user
    },

    // user is not logged in, only show public info
    hideSensitive: (user) => {
      delete user.passwordhash
      delete user.friends
      delete user.pets
      delete user.credits
      delete user.foods

      // remaining fields: username, pfp, displayname, favoritePets, joinDate
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
      delete pet.interactions
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
  catch (e) { return res.status(500).json({ error: e.toString() }) }


  if (req.session.user && req.session.user._id === id)
    res.json(protect.user.showSensitive(user))
  else res.json(protect.user.hideSensitive(user))
})

router.post('/', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.put('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.patch('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.put('/:id/password', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.put('/:id/food', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.delete('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

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
    catch (e) { return res.status(500).json({ error: e.toString() }) }

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
    catch (e) { return res.status(500).json({ error: e.toString() }) }

    if (req.session.user && req.session.user._id === id)
      res.json(pets.map(protect.pet.showSensitive))
    else res.json(pets.map(protect.pet.hideSensitive))
  }
})

router.post('/:id/pets', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

module.exports = router
