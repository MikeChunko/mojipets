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
      data = require("../../data"),
      cloneDeep = require("lodash.clonedeep");;

/** 
 * helper functions to remove sensitive fields from objects on return 
 **/
const protect = {
  user: {
    // user is logged in, show private info
    showSensitive: (user) => {
      user_ = cloneDeep(user);
      delete user_.passwordhash
      return user_
    },

    // user is not logged in, only show public info
    hideSensitive: (user) => {
      user_ = cloneDeep(user)
      delete user_.passwordhash
      delete user_.friends
      delete user_.pets
      delete user_.credits
      delete user_.foods

      // remaining fields: username, pfp, displayname, favoritePets, joinDate
      return user_
    }
  },
  pet: {
    // pet owner is logged in, show private info
    showSensitive: (pet) => {
      pet_ = cloneDeep(pet)
      delete pet_.interactions
      return pet_
    },

    // pet owner is not logged in, only show public info
    hideSensitive: (pet) => {
      pet_ = cloneDeep(pet)
      delete pet_.interactions
      delete pet_.happiness
      delete pet_.health

      // remaining fields: name, birthday, emoji
      return pet_
    }
  }
}

router.get('/', async (req, res) => {
  if (!req.session.user)
    return res.status(403).json({
      error: 'Not logged in! No current user.'
    })

  res.json(protect.user.showSensitive(req.session.user))
})

// TODO: 🐛 check for bugs
router.get('/:id', async (req, res) => {
  let id = req.params.id,
      user = null;

  // Error checking
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })

  try { user = await data.users.get(id) }
  catch (e) {
    if (e.toString().startsWith('No user could be found'))
      return res.status(404).json({ error: e.toString() })
    // TODO: consider using error 400 for bad-input errors from this fcn?
    return res.status(500).json({ error: e.toString() })
  }

  if (req.session.user && req.session.user._id === id)
    res.json(protect.user.showSensitive(user))
  else res.json(protect.user.hideSensitive(user))
})

router.post('/', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

// TODO: consider excluding put and patch for /:id

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
      alive = req.query.alive == 'true',
      user = null

  // Error checking
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })
  try { user = await data.users.get(id) }
  catch (e) {
    if (e.toString().startsWith('No user could be found'))
      return res.status(404).json({ error: e.toString() })
    // TODO: consider using error 400 for bad-input errors from this fcn?
    return res.status(500).json({ error: e.toString() })
  }

  // api doesn't care abt alive/dead
  if (alive == null || alive == undefined) { 
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

router.post('/:id/favoritePets', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.delete('/:id/favoritePets/:petid', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

module.exports = router
