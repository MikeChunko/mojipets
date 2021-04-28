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
      storePets = data.storePets,
      storeFood = data.storeFood;

router.get("/", (req, res) => {
  // TODO: Fill with real data

  // ! Debug so I don't need to log in each time
  let credits;
  try {
    credits = req.session.user.credits;
  } catch (e) {
    credits = 1000;
  }

  let shopPets = [{emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 10},
  {emoji: {name: "cat", img: "/public/resources/pets/bear.svg"}, price: 11},
  {emoji: {name: "cat", img: "/public/resources/pets/giraffe.svg"}, price: 12},
  {emoji: {name: "cat", img: "/public/resources/pets/dog.svg"}, price: 13},
  {emoji: {name: "cat", img: "/public/resources/pets/cow.svg"}, price: 14},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 15},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 16},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 17},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 18},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 19},
  {emoji: {name: "cat", img: "/public/resources/pets/cat.svg"}, price: 20}];

  let shopFood = [{emoji: {name: "cat", img: "/public/resources/food/bagel.svg"}, price: 10},
  {emoji: {name: "cat", img: "/public/resources/food/donut.svg"}, price: 11},
  {emoji: {name: "cat", img: "/public/resources/food/falafel.svg"}, price: 12},
  {emoji: {name: "cat", img: "/public/resources/food/mango.svg"}, price: 13},
  {emoji: {name: "cat", img: "/public/resources/food/meat_on_bone.svg"}, price: 14},
  {emoji: {name: "cat", img: "/public/resources/food/melon.svg"}, price: 15},
  {emoji: {name: "cat", img: "/public/resources/food/onigiri.svg"}, price: 16},
  {emoji: {name: "cat", img: "/public/resources/food/pie.svg"}, price: 17},
  {emoji: {name: "cat", img: "/public/resources/food/pizza.svg"}, price: 18},
  {emoji: {name: "cat", img: "/public/resources/food/sushi.svg"}, price: 19},
  {emoji: {name: "cat", img: "/public/resources/food/bagel.svg"}, price: 20}];

  res.render("mojipets/shop", {
    title: "MojiPets",
    shopPets: shopPets,
    shopFood: shopFood,
    money: credits,
    css: "/public/site.css",
    postjs: "/public/shop.js"
  });
});

module.exports = router;
