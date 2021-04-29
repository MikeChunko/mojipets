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
 * helper functions to remove sensitive fields from the user object on return 
 **/
const protectUser = {
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
    res.json(protectUser.showSensitive(user))
  else res.json(protectUser.hideSensitive(user))
})

module.exports = router
