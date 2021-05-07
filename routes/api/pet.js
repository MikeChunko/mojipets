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

// For calculating the number of days from date d1 to date d2.
const daysDifference = (d1, d2) =>
      Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))

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
      pet_ = cloneDeep(pet);
      console.log(pet_);
      delete pet_.interactions
      delete pet_.happiness
      delete pet_.health

      // remaining fields: name, birthday, emoji
      return pet_
    }
  }
}


/** Router Functions **/

router.get('/:id', async (req, res) => {
  let id = req.params.id,
    pet = null;

  // Error checking
  if (!id) return res.status(400).json({ error: 'id not given' })
  if (typeof(id) != "string")
    return res.status(400).json({ error: 'type of id not string' })
  if (id.trim().length == 0)
    return res.status(400).json({
      error: 'id is either an empty string or just whitespace.'
    });

  try { pet = await data.userPets.get(id) }
  catch (e) {
    if (e.toString().startsWith('No pet could be found'))
      return res.status(404).json({ error: e.toString() })
    // TODO: consider using error 400 for bad-input errors from this fcn?
    return res.status(500).json({ error: e.toString() })
  }

  if (req.session.pet && req.session.user._pet === id)
    res.json(protect.pet.showSensitive(pet))
  else res.json(protect.pet.hideSensitive(pet));
})

// TODO: consider excluding put and patch

router.put('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.patch('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})

router.delete('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
})


router.post('/:id/interactions/feed', async (req, res) => {
  // Error checking
  let id = req.params.id,
      foodId = req.body['food.id'],
      user = null,
      pet = null;

  if (!id || typeof(id) != "string")
    return res.sendStatus(400);

  if (!foodId || typeof(foodId) != "string")
    return res.status(400).json({
      error: 'food field is required. must be a valid food id'
    })

  if (!req.session.user)
    return res.status(403).json({
      error: `Not authorized to feed pet '${id}'`
    })

  try { user = await data.userPets.getOwner(id) }
  catch (e) {
    if (e.toString().startsWith('No pet could be found'))
      return res.status(404).json({ error: e.toString() })
    return res.status(500).json({ error: e.toString() })
  }

  if (user._id !== req.session.user._id)
    return res.status(403).json({
      error: `This user is not authorized to feed pet '${id}'`
    })

  try { pet = await data.userPets.get(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (daysDifference(pet.health, new Date()) > 9)
    return res.status(400).json({
      error: `Cannot feed pet '${id}'. This pet is dead.`
    })

  // TODO: consider using error 400 for bad-input errors from this fcn?
  try { pet = await data.userPets.feed({ id, foodId }) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  // send updated pet to browser
  res.json(protect.pet.showSensitive(pet))

  // update user in session
  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.status(500).json({ error: e.toString() })}
  req.session.user = protect.user.showSensitive(user)
})

router.post('/:id/interactions/fetch', async (req, res) => {
  // Error checking
  let id = req.params.id,
      user = null,
      pet = null;

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  if (!req.session.user)
    return res.status(403).json({
      error: `Not authorized to play fetch with pet '${id}'`
    })

  try { user = await data.userPets.getOwner(id) }
  catch (e) {
    if (e.toString().startsWith('No pet could be found'))
      return res.status(404).json({ error: e.toString() })
    // TODO: consider using error 400 for bad-input errors from this fcn?
    return res.status(500).json({ error: e.toString() })
  }

  if (user._id !== req.session.user._id)
    return res.status(403).json({
      error: `This user is not authorized to play fetch with pet '${id}'`
    })

  try { pet = await data.userPets.get({ id }) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (daysDifference(pet.health, new Date()) > 9)
    return res.status(400).json({
      error: `Cannot play fetch with pet '${id}'. This pet is dead.`
    })

  // TODO: consider using error 400 for bad-input errors from this fcn?
  try { pet = await data.userPets.fetch(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  // send updated pet to browser
  res.json(protect.pet.showSensitive(pet))

  // update user in session
  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.status(500).json({ error: e.toString() })}
  req.session.user = protect.user.showSensitive(user)
})

module.exports = router
