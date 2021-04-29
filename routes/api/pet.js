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


/** Router Functions **/

router.get('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})


router.put('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.patch('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.delete('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

// TODO: 🐛 check for bugs
router.post('/:id/interactions/feed', async (req, res) => {
  // Error checking
  let id = req.params.id,
      user = null,
      pet = null;

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  if (!req.session.user)
    return res.sendStatus(403).json({
      error: `Not authorized to feed pet '${id}'`
    })

  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.sendStatus(500).json({ error: e.tostring() })}

  if (user._id !== req.session.user._id)
    return res.sendStatus(403).json({
      error: `This user is not authorized to feed pet '${id}'`
    })

  try { pet = await data.userPets.fetch(id) }
  catch (e) { return res.sendStatus(500).json({ error: e.toString() }) }

  // send updated pet to browser
  res.json(protect.pet.showSensitive(pet))

  // update user in session
  try { user = await data.userPets.getOwner(id) }
  catch (e) { return res.sendStatus(500).json({ error: e.tostring() })}
  req.session.user = protect.user.showSensitive(user)
})

router.post('/:id/interactions/fetch', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

module.exports = router
