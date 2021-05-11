/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const { ObjectID } = require('bson'),
      ObjectIdMongo = require('mongodb').ObjectID,
      mongoCollections = require('../config/mongoCollections'),
      { users } = require('../config/mongoCollections'),
      usersJs = require('./users'),
      moment = require("moment"),
      {
        isEmoji,
        isImg,
        isDate,
        clean
      } = require("../util");

async function add(body) {
  let owner = body.owner
  let name = body.name
  let emoji = body.emoji
  let price = body.price

  if (!owner) throw 'Error: must provide owner id of the pet.'
  if (!name) throw 'Error: must provide the name of the pet.'
  if (!emoji) throw 'Error: must provide an emoji for the pet.'
  if (!price) { price = 0 }

  if (typeof(owner) != 'string') throw 'Error: owner must be a string.'
  if (typeof(name) != 'string') throw 'Error: name must be a string.'
  if (typeof(emoji) != 'object') throw 'Error: emoji must be an object.'
  if (typeof(price) != 'number') throw 'Error: price must be a positive number'
  if (!('codepoint' in emoji)) throw 'Error: emoji object must have a codepoint.'
  if (!('name' in emoji)) throw 'Error: emoji object must have a name.'
  if (!('img' in emoji)) throw 'Error: emoji object must have a img.'

  if (name.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'
  if (typeof(emoji.name) != 'string') throw 'Error: emoji name must be a string.'
  if (!isEmoji(emoji.codepoint)) throw 'Error: emoji codepoint not an emoji.'
  if (!isImg(emoji.img)) throw 'Error: emoji img not an img.'
  if (price < 0) throw 'Error: price must be a positive number'

  // if (!birthday) throw 'Error: must provide a birthday for the pet.'
  // if (typeof(birthday) != 'string') throw 'Error: birthday is not a valid date string'
  // let dateSplit = birthday.split("/")
  // if (dateSplit.length != 3) throw 'Error: birthday is not a valid date string.'
  // let dateObj = new Date(parseInt(dateSplit[2], 10), parseInt(dateSplit[0], 10) - 1, parseInt(dateSplit[1], 10)) // https://stackoverflow.com/questions/10430321/how-to-parse-a-dd-mm-yyyy-or-dd-mm-yyyy-or-dd-mmm-yyyy-formatted-date-stri
  // if (!isDate(dateObj)) throw 'Error: birthday is not a valid date string'

  let birthday = new Date();
  let interactions = { fetch: [], feed: [] }

  let newPet = {
    _id: ObjectID(),
    name: name.trim(),
    birthday: birthday,
    emoji: emoji,
    happiness: birthday,
    health: birthday,
    interactions: interactions
  }

  let user = null;
  try {
    user = await usersJs.get(owner)
  } catch (e) {
    throw e
  }
  user.pets.push(newPet)
  if (user.credits - price < 0) throw 'Error: user does not have enough credits to purchase pet.'
  user.credits -= price
  delete user._id;

  let userCollection = await users()

  let updateId = ObjectIdMongo(owner)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: user })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not add new pet to user.'
  return await get(newPet._id.toString())
}

async function get(id) {
  let _id = null
  // Error checking
  if (!id) throw 'Error: must provide an id for get.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  try { _id = ObjectIdMongo(id) }
  catch (e) { throw `Error: id '${id}' is not a valid ObjectID.` }
  // Logic
  const userCollection = await users()
  const user = await userCollection.findOne({'pets._id': _id})
  if (user === null) throw `No pet could be found with the id '${id}'.`
  const userPet = user.pets.find(p => p._id.toString() === id)
  return clean(userPet)
}

async function getOwner(id) {
  let _id = null
  // Error checking
  if (!id) throw 'Error: must provide an id for get.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  try { _id = ObjectIdMongo(id) }
  catch (e) { throw `Error: id '${id}' is not a valid ObjectID.` }
  // Logic
  const userCollection = await users()
  const user = await userCollection.findOne({'pets._id': _id})
  if (user === null) throw `No pet could be found with the id '${id}'.`
  return clean(user)
}

async function getPetsFromUser(id) {
  let user = null
  try { user = await usersJs.get(id) }
  catch (e) { throw e }
  return user.pets.map(clean)
}

async function updatePetInUser(pet) {
  if (!pet) throw 'Error: updating pet requires a pet'
  id = pet._id.toString()
  let owner = null
  try {
    owner = await getOwner(id)
  } catch (e) {
    throw e
  }

  newPets = []
  for (currPet of owner.pets) {
    if (currPet._id != id) {
      newPets.push(currPet)
    }
  }
  newPets.push(pet)

  owner.pets = newPets

  let updateId = ObjectIdMongo(owner._id)
  delete owner._id
  const userCollection = await users()
  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: owner })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not update pet.'
  return pet
}

async function feed(id) {
  if (!id) throw 'Error: must provide a userId.'
  if (typeof(id) != "string") throw 'Error: type of userId not string.'
  if (id.trim().length == 0) throw 'Error: userId is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }

  let date = new Date();

  pet._id = ObjectIdMongo(pet._id)
  pet.health = date;
  pet.interactions.feed.push(date)

  let owner = null
  try {
    owner = await getOwner(id)
  } catch (e) {
    throw e
  }

  newPets = []
  for (currPet of owner.pets) {
    if (currPet._id != id) {
      newPets.push(currPet)
    }
  }
  newPets.push(pet)

  owner.pets = newPets

  // if (!owner.foods[foodId] || owner.foods[foodId] <= 0) {
  //   if (!owner.foods[foodId] || owner.foods[foodId] != -1) throw 'Error: not enough food to feed pet.'
  // }
  // if (owner.foods[foodId] != -1) {
  //   owner.foods[foodId] -= 1
  // }
  // if (owner.foods[foodId] == 0) {
  //   delete owner.foods[foodId]
  // }

  let updateId = ObjectIdMongo(owner._id)
  delete owner._id
  const userCollection = await users()

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: owner })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not feed pet.'
  return pet
}

async function fetch(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }

  let date = new Date();

  pet._id = ObjectIdMongo(pet._id)
  pet.happiness = date;
  pet.interactions.fetch.push(date)

  newPet = null
  try {
    newPet = await updatePetInUser(pet)
  } catch (e) {
    console.log(e)
    throw 'Error: could not make pet fetch.'
  }
  return newPet
}

async function favorite(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }
  let owner = null
  try {
    owner = await getOwner(id)
  } catch (e) {
    throw e
  }
  const petId = ObjectIdMongo(id)
  if (owner.favoritePets.includes(petId)) throw 'Error: pet is already a favorite.'
  owner.favoritePets.push(petId)
  const userId = ObjectIdMongo(owner._id)
  delete owner._id
  const userCollection = await users()
  const updateInfo = await userCollection.updateOne({ _id: userId }, { $set: owner })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not favorite pet.'
  return owner.favoritePets
}

async function unfavorite(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }
  let owner = null
  try {
    owner = await getOwner(id)
  } catch (e) {
    throw e
  }
  const petId = ObjectIdMongo(id)
  // if (!owner.favoritePets.includes(petId)) throw 'Error: pet is not a favorite.'
  let newFavPets = []
  for (currPet of owner.favoritePets) {
    if (!currPet.equals(petId)) {
      newFavPets.push(currPet)
    }
  }
  owner.favoritePets = newFavPets
  const userId = ObjectIdMongo(owner._id)
  delete owner._id
  const userCollection = await users()
  const updateInfo = await userCollection.updateOne({ _id: userId }, { $set: owner })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not unfavorite pet.'
  return owner.favoritePets
}

async function getStatus(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }
  let currentDateTimestamp = new Date().getTime()
  let lastFeedTime = pet.health.getTime()
  if (lastFeedTime + (3 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Healthy" }
  if (lastFeedTime + (6 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Unwell" }
  if (lastFeedTime + (8 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Sickly" }
  if (lastFeedTime + (9 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Near-Death" }
  return "Dead"
}

async function getHappiness(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }
  let currentDateTimestamp = new Date().getTime()
  let lastPlayTime = pet.happiness.getTime()
  if (lastPlayTime + (3 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Happy" }
  if (lastPlayTime + (6 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Content" }
  if (lastPlayTime + (8 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Unhappy" }
  if (lastPlayTime + (9 * 24 * 60 * 60 * 1000) >= currentDateTimestamp) { return "Miserable" }
  return "Depressed"
}

async function getAge(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }

  const diff = moment.utc(moment().diff(pet.birthday)),
        years = diff.year() - 1970,
        months = diff.month(),
        days = diff.dayOfYear() - 1;
  let age = "";

  if (years != 0) {
    age += years;

    if (years == 1)
      age += " year ";
    else
      age += " years "
  }

  if (months != 0) {
    age += months;

    if (months == 1)
      age += " month ";
    else
      age += " months "
  }

  if (days != 0) {
    age += days;

    if (days == 1)
      age += " day ";
    else
      age += " days "
  }

  if (age.trim().length == 0)
    age = "Newborn";
  else
    age += "old";

  return age;
}

async function killPet(id) { // for testing
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    console.log(e)
    throw e
  }
  let petDeathDate = new Date();
  petDeathDate.setDate(petDeathDate.getDate() - 9);
  pet.health = petDeathDate;
  pet._id = ObjectIdMongo(pet._id)

  newPet = null
  try {
    newPet = await updatePetInUser(pet)
  } catch (e) {
    throw 'Error: could not make kill pet.'
  }
  return newPet
}

async function depressPet(id) { // for testing
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try {
    pet = await get(id)
  } catch (e) {
    throw e
  }
  let petDepressionDate = new Date();
  petDepressionDate.setDate(petDepressionDate.getDate() - 9);
  pet.happiness = petDepressionDate;
  pet._id = ObjectIdMongo(pet._id)

  newPet = null
  try {
    newPet = await updatePetInUser(pet)
  } catch (e) {
    throw 'Error: could not make pet depressed.'
  }
  return newPet
}

async function getTotalInteractions(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try { pet = await get(id) }
  catch (e) { throw e }
  return pet.interactions.feed.length + pet.interactions.fetch.length
}

async function getHealthAsNumber(id) {
  if (!id) throw 'Error: must provide an id.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let pet = null
  try { pet = await get(id) }
  catch (e) { throw e }
  let currentDateTimestamp = new Date().getTime()
  let nineDaysPrior = currentDateTimestamp - (9 * 24 * 60 * 60 * 1000)
  let lastFeedTime = pet.health.getTime()
  let ret = (lastFeedTime - nineDaysPrior) / (9 * 24 * 60 * 60 * 1000)
  if (ret <= 0) {return 0}
  return ret
}


module.exports = {
  add,
  get,
  getPetsFromUser,
  feed,
  fetch,
  favorite,
  unfavorite,
  getStatus,
  getHappiness,
  getAge,
  getOwner,
  killPet,
  depressPet,
  getTotalInteractions,
  getHealthAsNumber
}
