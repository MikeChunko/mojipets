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
      { storePets } = require('../config/mongoCollections'),
      usersJs = require('./users'),
      userPetsJs = require('./userPets'),
      {
        isEmoji,
        isImg,
        isDate,
        clean
      } = require("../util");

async function add(body) {
  let emoji = body.emoji
  let price = body.price
  let rarity = body.rarity
  if (!emoji) throw 'Error: must provide an emoji for the pet.'
  if (!price) throw 'Error: must provide an price for the pet.'
  if (!rarity) throw 'Error: must provide an rarity for the pet.'

  if (typeof(price) != 'number') throw 'Error: price must be a number.'
  if (typeof(rarity) != 'number') throw 'Error: rarity must be a number.'
  if (typeof(emoji) != 'object') throw 'Error: emoji must be an object.'
  if (!('codepoint' in emoji)) throw 'Error: emoji object must have a codepoint.'
  if (!('name' in emoji)) throw 'Error: emoji object must have a name.'
  if (!('img' in emoji)) throw 'Error: emoji object must have a img.'
  if (typeof(emoji.name) != 'string') throw 'Error: emoji name must be a string.'
  if (!isEmoji(emoji.codepoint)) throw 'Error: emoji codepoint not an emoji.'
  if (!isImg(emoji.img)) throw 'Error: emoji img not an img.'

  if (price < 0) throw 'Error: price for a pet cannot be < 0.'
  if (rarity < 0) throw 'Error: rarity cannot be < 0.'

  let newStorePet = {
    emoji: emoji,
    price: price,
    rarity: rarity
  }

  let storePetCollection = await storePets()

  let insertInfo = await storePetCollection.insertOne(newStorePet)
  if (insertInfo.insertedCount == 0) throw 'Error: could not add storePet.'
  const newId = insertInfo.insertedId
  const pet = await get(newId.toString())
  return clean(pet)
}

async function get(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'

  const storePetCollection = await storePets()

  const pet = await storePetCollection.findOne({ _id: ObjectID(id) })
  if (pet === null) throw `No pet could be found with the id '${id}'`
  return clean(pet)
}

async function getAll() {
  const storePetCollection = await storePets()
  const storePetArr = await storePetCollection.find({}).toArray()
  return storePetArr.map(clean)
}

async function buy(body) {
    let userId = body.userId
    let petId = body.petId
    let petName = body.petName
    if (!userId) throw 'Error: userId not given.'
    if (!petId) throw 'Error: petId not given.'
    if (typeof(userId) != "string") throw 'Error: type of userId not string.'
    if (typeof(petId) != "string") throw 'Error: type of petId not string.'
    if (userId.trim().length == 0) throw 'Error: userId is either an empty string or just whitespace.'
    if (petId.trim().length == 0) throw 'Error: petId is either an empty string or just whitespace.'

    let pet = null
    try {
        pet = await get(petId)
    } catch (e) {
        throw e
    }

    let userPet = null
    try {
      userPet = await userPetsJs.add({owner: userId, name: petName, emoji: pet.emoji, price: pet.price})
    } catch (e) {
      throw e
    }
    return clean(userPet)
}


module.exports = {
  add,
  get,
  buy,
  getAll
}
