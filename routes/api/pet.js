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
      { protect } = require("../../util"),
      config = require("../../config.json");

// For calculating the number of days from date d1 to date d2.
const daysDifference = (d1, d2) =>
      Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))

/** Router Functions **/

router.get('/:id', async (req, res) => {
  let id = xss(req.params.id),
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
    return res.status(500).json({ error: e.toString() })
  }

  if (req.session.user) {
    const pets = req.session.user.pets;
    if(pets && pets.length)
    for(let i = 0; i < pets.length; i++) {
      const p = pets[i];
      if(p._id === id) {
        res.json(protect.pet.showSensitive(pet));
        return;
      }
    }

    res.json(protect.pet.hideSensitive(pet));
  }
  else res.json(protect.pet.hideSensitive(pet));
})

router.post('/:id/interactions/feed', async (req, res) => {
  // Error checking
  let id = xss(req.params.id),
      foodId = xss(req.body['food.id']),
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

  if (!req.session.health_owed || req.session.health_owed <= 0) { // new health_owed
    return res.status(400).json({
      error: `Cannot feed pet if no food has been placed.`
    })
  } else {
    req.session.health_owed -= 1;
  }

  try { pet = await data.userPets.feed(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  // Add credits for feeding
  try {
    // Check for if the favorite food was given
    let favoriteModifier = pet.favoriteFood == foodId ? 3.0 : 1.0;

    req.session.user = await data.users.modifyCredits({
      userId: req.session.user._id,
      credits: config.feedBaseCredits * favoriteModifier
    });
  } catch (e) {
    return res.status(500).json({ error: e.toString() })
  }

  // send updated pet to browser
  res.json(protect.pet.showSensitive(pet))

  // update user in session
  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.status(500).json({ error: e.toString() })}
  req.session.user = await protect.user.showSensitive(user)
})

router.post('/:id/interactions/fetch', async (req, res) => {
  // Error checking
  let id = xss(req.params.id),
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
    return res.status(500).json({ error: e.toString() })
  }

  if (user._id !== req.session.user._id)
    return res.status(403).json({
      error: `This user is not authorized to play fetch with pet '${id}'`
    })

  try { pet = await data.userPets.get(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  if (daysDifference(pet.health, new Date()) > 9)
    return res.status(400).json({
      error: `Cannot play fetch with pet '${id}'. This pet is dead.`
    })

  try { pet = await data.userPets.fetch(id) }
  catch (e) { return res.status(500).json({ error: e.toString() }) }

  // Add credits for fetching
  try {
    req.session.user = await data.users.modifyCredits({
      userId: req.session.user._id,
      credits: config.fetchBaseCredits
    });
  } catch (e) {
    return res.status(500).json({ error: e.toString() })
  }

  // send updated pet to browser
  res.json(protect.pet.showSensitive(pet))

  // update user in session
  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.status(500).json({ error: e.toString() })}
  req.session.user = protect.user.showSensitive(user)
})

module.exports = router
