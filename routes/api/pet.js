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
      delete pet.interacitions
      delete pet.happiness
      delete pet.health

      // remaining fields: name, birthday, emoji
      return pet
    }
  }
}


/** Router Functions **/

router.get('/:id', async (req, res) => {
  res.status(500).json({ error: 'TODO: implement' })
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
