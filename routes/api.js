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
      data = require("../data"),
      userData = data.users,
      userPets = data.userPets,
      storePets = data.storePets,
      storeFood = data.storeFood;

  router.post("/store/food/:id/:quantity", async (req, res) => {
    // Error checking
    let id = req.params.id,
        quantity = req.params.quantity;

    if (!id || typeof(id) != "string" ||
        !quantity || typeof(quantity) != "string" ||
        isNaN(parseInt(quantity)))
      return res.sendStatus(404);

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
      console.log(e);
      return res.sendStatus(500)
    }

    return res.status(200).json({text: "success!"});
  })

module.exports = router;
