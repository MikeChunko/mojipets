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

router.get("/all", async (req, res) => {
  users = await userData.getAllUsers();

  res.json(users.map(user => protect.user.hideSensitive(user)));
})

router.get('/:id', async (req, res) => {
  let id = xss(req.params.id),
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
    return res.status(500).json({ error: e.toString() })
  }

  if (req.session.user && req.session.user._id === id)
    res.json(protect.user.showSensitive(user))
  else res.json(protect.user.hideSensitive(user))
})

router.post('/', async (req, res) => {
  let body = req.body;
  if (!body) return res.status(400).json({ error: 'no info given' })
  let username = xss(body.username)
  let password = xss(body.password)
  let displayname = xss(body.displayname)
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

router.put('/:id/password', async (req, res) => {
  let id = xss(req.params.id)
  let body = req.body;
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (!body) return res.status(400).json({ error: 'body not given' })
  let oldpassword = xss(body.oldpassword)
  let newpassword = xss(body.newpassword)
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })
  if (!oldpassword) return res.status(400).json({ error: 'oldpassword not given' })
  if (typeof(oldpassword) != "string")
    return res.status(400).json({ error: 'type of oldpassword not string' })
  if (oldpassword.trim().length == 0)
    return res.status(400).json({
      error: 'oldpassword is either an empty string or just whitespace.'
    })
  if (!newpassword) return res.status(400).json({ error: 'newpassword not given' })
  if (typeof(newpassword) != "string")
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

router.get('/:id/pets', async (req, res) => {
  // Error checking
  let id = xss(req.params.id),
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
  let userId = xss(req.params.id)
  let body = req.body
  if (!body) return res.status(400).json({ error: 'body not given' })
  let name = xss(body.name)
  let petId = xss(body.store)

  if (!userId) return res.status(400).json({ error: 'userId not given' })
  if (typeof(userId) != "string")
    return res.status(400).json({ error: 'type of userId not string' })
  if (userId.trim().length == 0)
    return res.status(400).json({
      error: 'userId is either an empty string or just whitespace.'
    })
  if (!name) return res.status(400).json({ error: 'name not given' })
  if (typeof(name) != "string")
    return res.status(400).json({ error: 'type of name not string' })
  if (name.trim().length == 0)
    return res.status(400).json({
      error: 'name is either an empty string or just whitespace.'
    })
  if (!petId) return res.status(400).json({ error: 'store not given' })
  if (typeof(petId) != "string")
    return res.status(400).json({ error: 'type of store not string' })
  if (petId.trim().length == 0)
    return res.status(400).json({
      error: 'store is either an empty string or just whitespace.'
    })

  let user = null;
  try { user = await data.users.get(userId) }
  catch (e) { return res.status(500).json({error: e.toString()}) }

  if (!req.session.user) return res.status(403).json({
    error: 'cannot buy a pet without being logged in'
  })
  if (req.session.user._id != userId) return res.status(403).json({
    error: `cannot buy pet as a different user`
  })

  let pet = null;
  try { pet = await data.storePets.buy({userId: userId, petId: petId, petName: name}) }
  catch (e) { return res.status(500).json({error: e.toString()}) }

  req.session.user = await userData.get(userId);
  res.json(protect.pet.showSensitive(pet))
})

router.post('/:id/foods/:foodid', async (req, res) => {
  let id = xss(req.params.id);
  let foodId = xss(req.params.foodid);
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })
  if (!foodId) return res.status(400).json({ error: 'foodId not given' })
  if (typeof(foodId) != "string")
    return res.status(400).json({ error: 'type of foodId not string' })
  if (foodId.trim().length == 0)
    return res.status(400).json({
      error: 'foodId is either an empty string or just whitespace.'
    })

  let user = null;
  try { user = await data.users.get(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (!req.session.user) return res.status(403).json({
    error: 'cannot place food without being logged in'
  })
  if (req.session.user._id != id) return res.status(403).json({
    error: `cannot place food as a different user`
  })

  if (!user.foods[foodId] || user.foods[foodId] <= 0) {
    if (!user.foods[foodId] || user.foods[foodId] != -1) {
      return res.status(400).json({ error: 'Error: not enough food to feed pet.' })
    }
  }

  try { user = await data.users.placeFood({userId: id, foodId: foodId}) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (!req.session.health_owed) {
    req.session.health_owed = 1;
  } else {
    req.session.health_owed += 1;
  }

  req.session.user = await protect.user.showSensitive(user)
  res.json(user.foods[foodId])
})

router.post('/:id/toys/:toyid', async (req, res) => {
  let id = xss(req.params.id);
  let toyId = xss(req.params.toyid);
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    })
  if (!toyId) return res.status(400).json({ error: 'toyId not given' })
  if (typeof(toyId) != "string")
    return res.status(400).json({ error: 'type of toyId not string' })
  if (toyId.trim().length == 0)
    return res.status(400).json({
      error: 'toyId is either an empty string or just whitespace.'
    })

  let user = null;
  try { user = await data.users.get(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (!req.session.user) return res.status(403).json({
    error: 'cannot place toy without being logged in'
  })
  if (req.session.user._id != id) return res.status(403).json({
    error: `cannot place toy as a different user`
  })

  if (!user.toys[toyId] || user.toys[toyId] <= 0) {
    if (!user.toys[toyId] || user.toys[toyId] != -1) {
      return res.status(400).json({ error: 'Error: not enough food to feed pet.' })
    }
  }

  try { user = await data.users.placeToy({userId: id, toyId: toyId}) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (!req.session.happiness_owed) {
    req.session.happiness_owed = 1;
  } else {
    req.session.happiness_owed += 1;
  }

  req.session.user = await protect.user.showSensitive(user)
  res.json(user.toys[toyId])
})

router.post('/:id/favoritePets/:petid', async (req, res) => {
  let petId = xss(req.params.petid)
  let userId = xss(req.params.id)

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
  let petId = xss(req.params.petid)
  let userId = xss(req.params.id)

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

router.post('/:id/friends/:friendid', async (req, res) => {
  if (!req.session.user || req.session.user._id.toString() != xss(req.params.id))
    return res.sendStatus(403);

  if (!req.params.id || typeof(req.params.id) != "string" ||
      xss(req.params.id).trim().length == 0)
    return res.sendStatus(400)

  if (!req.params.friendid || typeof(req.params.friendid) != "string" ||
      xss(req.params.friendid).trim().length == 0)
    return res.sendStatus(400)

  try {
    await userData.get(xss(req.params.friendid));
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }

  try {
    let [u1, u2] = await userData.makeFriends({
      userId1: xss(req.params.id),
      userId2: xss(req.params.friendid)
    });

    // Update session info
    req.session.user = u1;
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
})

router.delete('/:id/friends/:friendid', async (req, res) => {
  if (!req.session.user || req.session.user._id.toString() != xss(req.params.id))
    return res.sendStatus(403);

  if (!req.params.id || typeof(req.params.id) != "string" ||
      xss(req.params.id).trim().length == 0)
    return res.sendStatus(400)

  if (!req.params.friendid || typeof(req.params.friendid) != "string" ||
      xss(req.params.friendid).trim().length == 0)
    return res.sendStatus(400)

  try {
    await userData.get(xss(req.params.friendid));
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }

  try {
    let [u1, u2] = await userData.removeFriends({
      userId1: xss(req.params.id),
      userId2: xss(req.params.friendid)
    });

    // Update session info
    req.session.user = u1;
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
})

router.post("/privacy", async (req, res) => {
  if (!req.session.user)
    return res.sendStatus(403);

  let level = xss(req.body.level);
  if (!level)
    return res.sendStatus(400);

  level = parseInt(level);
  if (isNaN(level) || level < 0 || level > 2)
    return res.sendStatus(400);

  try {
    req.session.user = await userData.updatePrivacy(req.session.user._id, level);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
});

router.post("/displayname", async (req, res) => {
  if (!req.session.user)
    return res.sendStatus(403);

  let dname = xss(req.body.displayname);
  if (!dname || typeof (dname) != "string" || dname.trim().length == 0)
    return res.sendStatus(400);

  try {
    req.session.user = await userData.update({
      userId: req.session.user._id,
      username: req.session.user.username,
      displayname: dname,
      pfp: req.session.user.pfp
    });
    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.toString() });
  }
});

module.exports = router
