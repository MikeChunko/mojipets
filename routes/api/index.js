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
      userRoutes = require('./user.js'),
      userPetRoutes = require('./pet.js'),
      userData = data.users,
      userPets = data.userPets,
      storePets = data.storePets,
      storeFood = data.storeFood,
      storeToy = data.storeToys;

router.use('/user', userRoutes);
router.use('/user/pet', userPetRoutes);

router.post("/store/food/:id/:quantity", async (req, res) => {
  // Error checking
  let id = xss(req.params.id),
      quantity = xss(req.params.quantity);

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  if (!quantity || typeof(quantity) != "string" ||
      isNaN(parseInt(quantity)))
    return res.sendStatus(401);

  quantity = parseInt(quantity);

  try {
    const food = await storeFood.get(id);

    // Check for ability to buy
    if (req.session.user.credits - (food.price * quantity) < 0)
      return res.sendStatus(403);

    await storeFood.buy({
      userId: req.session.user._id,
      foodId: id,
      quantity: quantity
    })

    // If we've made it this far, then the purchase was successful

    // Update the user session
    const { passwordhash, ...user} = await userData.get(req.session.user._id);
    req.session.user = user;

    return res.json({ newCredits: req.session.user.credits });
  } catch (e) {  // Some error has occured in the db
    return res.sendStatus(500)
  }
});

router.post("/store/toy/:id/:quantity", async (req, res) => {
  // Error checking
  let id = xss(req.params.id),
      quantity = xss(req.params.quantity);

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  if (!quantity || typeof(quantity) != "string" ||
      isNaN(parseInt(quantity)))
    return res.sendStatus(401);

  quantity = parseInt(quantity);

  try {
    const toy = await storeToy.get(id);

    // Check for ability to buy
    if (req.session.user.credits - (toy.price * quantity) < 0)
      return res.sendStatus(403);

    await storeToy.buy({
      userId: req.session.user._id,
      toyId: id,
      quantity: quantity
    })

    // If we've made it this far, then the purchase was successful

    // Update the user session
    const { passwordhash, ...user} = await userData.get(req.session.user._id);
    req.session.user = user;

    return res.json({ newCredits: req.session.user.credits });
  } catch (e) {  // Some error has occured in the db
    console.log(e)
    return res.sendStatus(500)
  }
});

router.post("/store/pet/:id/:name", async (req, res) => {
  // Error checking
  const id = xss(req.params.id),
        name = xss(req.params.name);

  if (!id || typeof(id) != "string")
    return res.sendStatus(404);

  if (!name || typeof(name) != "string" || name.trim().length == 0)
    return res.sendStatus(401)

  try {
    const pet = await storePets.get(id);

    // Check for ability to buy
    if (req.session.user.credits - pet.price < 0)
      return res.sendStatus(403);

    await storePets.buy({
      userId: req.session.user._id,
      petId: id,
      petName: name
    })

    // If we've made it this far, then the purchase was successful

    // Update the user session
    const { passwordhash, ...user} = await userData.get(req.session.user._id);
    req.session.user = user;

    return res.json({ newCredits: req.session.user.credits });
  } catch (e) {  // Some error has occured in the db
    return res.sendStatus(500)
  }
});

module.exports = router;
