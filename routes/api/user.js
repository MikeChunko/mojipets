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
      bcrypt = require("bcrypt");

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
  let body = req.body;
  if (!body) return res.status(400).json({ error: 'no info given' })
  let username = body.username
  let password = body.password
  let displayname = body.displayname
  if (!username) return res.status(400).json({ error: 'username not given' })
  if (!password) return res.status(400).json({ error: 'password not given' })
  if (!displayname) return res.status(400).json({ error: 'displayname not given' })
  if (typeof(username) != "string")
    return res.status(400).json({ error: 'type of username not string' })
  if (typeof(password) != "string")
    return res.status(400).json({ error: 'type of password not string' })
  if (typeof(displayname) != "string")
    return res.status(400).json({ error: 'type of displayname not string' })
  if (username.trim().length == 0)
    return res.status(400).json({ error: 'username is either an empty string or just whitespace.' })
  if (password.trim().length == 0)
    return res.status(400).json({ error: 'password is either an empty string or just whitespace.' })
  if (displayname.trim().length == 0)
    return res.status(400).json({ error: 'displayname is either an empty string or just whitespace.' })
  
  let user = null;
  try { user = await data.users.add({ username: username, plaintextPassword: password, displayname: displayname }) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  res.json(protect.user.hideSensitive(user)) // unsure if you want me to change req.session.user in api
})

// TODO: consider excluding put and patch for /:id

router.put('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.patch('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.put('/:id/password', async (req, res) => {
  let id = req.params.id
  let body = req.body;
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (!body) return res.status(400).json({ error: 'body not given' })
  let oldpassword = body.oldpassword
  let newpassword = body.newpassword
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })
  if (typeof(id) != "oldpassword")
    return res.status(400).json({ error: 'type of oldpassword not string' })
  if (oldpassword.trim().length == 0)
    return res.status(400).json({
      error: 'oldpassword is either an empty string or just whitespace.'
    })
  if (typeof(id) != "newpassword")
    return res.status(400).json({ error: 'type of newpassword not string' })
  if (newpassword.trim().length == 0)
    return res.status(400).json({
      error: 'newpassword is either an empty string or just whitespace.'
    })

  let user = null;
  try { user = await data.users.get(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }
  const match = await bcrypt.compare(oldpassword, user.passwordhash)
  
  if (!match) return res.status(400).json({ error: `oldpassword is incorrect` })
  
  let pwUpdate = null;
  try { 
    pwUpdate = await data.users.updatePassword({ userId: id, plaintextPassword: newpassword })
  } catch (e) { return res.status(500).json({ error: e.toString() }) }

  res.json(protect.user.hideSensitive(pwUpdate))
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
