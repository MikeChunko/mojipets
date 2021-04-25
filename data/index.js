/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const userData = require("./users"),
      userPetData = require("./userPets"),
      storePetData = require("./storePets"),
      storeFoodData = require("./storeFood");

module.exports = {
  users: userData,
  userPets: userPetData,
  storePets: storePetData,
  storeFood: storeFoodData
}
