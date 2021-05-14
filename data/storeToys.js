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
      { storeToys } = require('../config/mongoCollections'),
      { users } = require('../config/mongoCollections'),
      usersJs = require('./users'),
      {
        isEmoji,
        isImg,
        isDate,
        clean
      } = require("../util");

async function add(body) {
  let emoji = body.emoji
  let price = body.price
  if (!emoji) throw 'Error: must provide an emoji for the pet.'
  if (!price) throw 'Error: must provide an price for the pet.'

  if (typeof(price) != 'number') throw 'Error: price must be a number.'
  if (typeof(emoji) != 'object') throw 'Error: emoji must be an object.'
  if (!('codepoint' in emoji)) throw 'Error: emoji object must have a codepoint.'
  if (!('name' in emoji)) throw 'Error: emoji object must have a name.'
  if (!('img' in emoji)) throw 'Error: emoji object must have a img.'
  if (typeof(emoji.name) != 'string') throw 'Error: emoji name must be a string.'
  if (!isEmoji(emoji.codepoint)) throw 'Error: emoji codepoint not an emoji.'
  if (!isImg(emoji.img)) throw 'Error: emoji img not an img.'

  if (price < 0) throw 'Error: price for a pet cannot be < 0.'

  let newStoreToy = {
    emoji: emoji,
    price: price
  }

  let storeToyCollection = await storeToys()

  let insertInfo = await storeToyCollection.insertOne(newStoreToy)
  if (insertInfo.insertedCount == 0) throw 'Error: could not add storeToy.'
  const newId = insertInfo.insertedId
  const toy = await get(newId.toString())
  return clean(toy)
}

async function get(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'

  const storeToyCollection = await storeToys()

  const toy =  await storeToyCollection.findOne({ _id: ObjectID(id) })
  if (toy === null) throw `No toy could be found with the id '${id}'`
  return clean(toy)
}

async function getAll() {
  const storeToyCollection = await storeToys()
  const storeToyArr = await storeToyCollection.find({}).toArray()
  return storeToyArr.map(clean)
}

async function buy(body) {
  let userId = body.userId
  let toyId = body.toyId
  let quantity = body.quantity
  if (!userId) throw 'Error: userId not given.'
  if (!toyId) throw 'Error: toyId not given.'
  if (!quantity) throw 'Error: quantity not given.'
  if (typeof(userId) != "string") throw 'Error: type of userId not string.'
  if (typeof(toyId) != "string") throw 'Error: type of toyId not string.'
  if (typeof(quantity) != "number") throw 'Error: type of quantity not number.'
  if (userId.trim().length == 0) throw 'Error: userId is either an empty string or just whitespace.'
  if (toyId.trim().length == 0) throw 'Error: toyId is either an empty string or just whitespace.'
  if (quantity < 0) throw 'Error: quantity must be a positive number.'

  let user = null
  try {
    user = await usersJs.get(userId)
  } catch (e) {
    throw e
  }

  let toy = null
  try {
    toy = await get(toyId)
  } catch (e) {
    throw e
  }

  newCredits = user.credits - (quantity * toy.price)

  if (newCredits < 0) throw 'Error: user does not have enough credits to make this purchase.'

  const realToyId = ObjectIdMongo(toyId)

  user.credits = newCredits
  if (!(realToyId in user.toys)) {
    user.toys[realToyId] = quantity
  } else {
    user.toys[realToyId] += quantity
  }

  delete user._id

  let userCollection = await users()

  let updateId = ObjectIdMongo(userId)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: user })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not add new toy to user.'
  let changedUser = await usersJs.get(userId)
  return clean(changedUser)
}


module.exports = {
  add,
  get,
  buy,
  getAll
}
