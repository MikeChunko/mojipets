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
      userData = data.users,
      bcrypt = require("bcrypt"),
      { protect } = require("../../util");

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

router.post('/:id/favoritePets/:petid', async (req, res) => {
  let petId = req.params.petid
  let userId = req.params.id

  if (!userId) return res.status(400).json({ error: 'userId not given' })
  if (typeof(userId) != "string")
    return res.status(400).json({ error: 'type of userId not string' })
  if (userId.trim().length == 0)
    return res.status(400).json({
      error: 'userId is either an empty string or just whitespace.'
    })

  if (!petId) return res.status(400).json({ error: 'petId not given' })
  if (typeof(petId) != "string")
    return res.status(400).json({ error: 'type of petId not string' })
  if (petId.trim().length == 0)
    return res.status(400).json({
      error: 'petId is either an empty string or just whitespace.'
    })
  if (!req.session.user) return res.status(403).json({
    error: 'cannot favorite a pet without being logged in'
  })
  if (req.session.user._id != userId) return res.status(403).json({
    error: `cannot add pet to different user's favorites`
  })

  let petOwner = null;
  try { petOwner = await data.userPets.getOwner(petId) }
  catch (e) { return res.status(500).json({error: e.toString()}) }
  if (petOwner._id != userId) return res.status(403).json({
    error: `cannot add unowned pet to favorites`
  })

  let favePets = null;
  try { favePets = await data.userPets.favorite(petId) }
  catch (e) { return res.status(500).json({error: e}) }

  req.session.user = await userData.get(userId);
  res.json(favePets.map(protect.pet.showSensitive))
})

router.delete('/:id/favoritePets/:petid', async (req, res) => {
  let petId = req.params.petid
  let userId = req.params.id

  if (!userId) return res.status(400).json({ error: 'userId not given' })
  if (typeof(userId) != "string")
    return res.status(400).json({ error: 'type of userId not string' })
  if (userId.trim().length == 0)
    return res.status(400).json({
      error: 'userId is either an empty string or just whitespace.'
    })

  if (!petId) return res.status(400).json({ error: 'petId not given' })
  if (typeof(petId) != "string")
    return res.status(400).json({ error: 'type of petId not string' })
  if (petId.trim().length == 0)
    return res.status(400).json({
      error: 'petId is either an empty string or just whitespace.'
    })
  if (!req.session.user) return res.status(403).json({
    error: 'cannot unfavorite a pet without being logged in'
  })
  if (req.session.user._id != userId) return res.status(403).json({
    error: `cannot delete pet from different user's favorites`
  })

  let petOwner = null;
  try { petOwner = await data.userPets.getOwner(petId) }
  catch (e) { return res.status(500).json({error: e.toString()}) }
  if (petOwner._id != userId) return res.status(403).json({
    error: `cannot delete unowned pet from favorites`
  })

  isFav = false
  for (i of petOwner.favoritePets) { // i'm so sorry for this
    if (i.toString() == petId) {
      isFav = true
      break;
    }
  }
  if (!isFav) return res.status(403).json({
    error: `cannot delete pet from favorites if pet is not a favorite`
  })

  let favePets = null;
  try { favePets = await data.userPets.unfavorite(petId) }
  catch (e) { return res.status(500).json({error: e}) }

  req.session.user = await userData.get(userId);
  res.json(favePets.map(protect.pet.showSensitive))
})

module.exports = router
