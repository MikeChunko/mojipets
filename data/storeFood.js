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
      { storeFood } = require('../config/mongoCollections'),
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

  let newStoreFood = {
    emoji: emoji,
    price: price
  }

  let storeFoodCollection = await storeFood()

  let insertInfo = await storeFoodCollection.insertOne(newStoreFood)
  if (insertInfo.insertedCount == 0) throw 'Error: could not add storeFood.'
  const newId = insertInfo.insertedId
  const food = await get(newId.toString())
  return clean(food)
}

async function get(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'

  const storeFoodCollection = await storeFood()

  const food =  await storeFoodCollection.findOne({ _id: ObjectID(id) })
  if (food === null) throw `No food could be found with the id '${id}'`
  return clean(food)
}

async function getAll() {
  const storeFoodCollection = await storeFood()
  const storeFoodArr = await storeFoodCollection.find({}).toArray()
  return storeFoodArr.map(clean)
}

async function buy(body) {
  let userId = body.userId
  let foodId = body.foodId
  let quantity = body.quantity
  if (!userId) throw 'Error: userId not given.'
  if (!foodId) throw 'Error: foodId not given.'
  if (!quantity) throw 'Error: quantity not given.'
  if (typeof(userId) != "string") throw 'Error: type of userId not string.'
  if (typeof(foodId) != "string") throw 'Error: type of foodId not string.'
  if (typeof(quantity) != "number") throw 'Error: type of quantity not number.'
  if (userId.trim().length == 0) throw 'Error: userId is either an empty string or just whitespace.'
  if (foodId.trim().length == 0) throw 'Error: foodId is either an empty string or just whitespace.'
  if (quantity < 0) throw 'Error: quantity must be a positive number.'

  let user = null
  try {
    user = await usersJs.get(userId)
  } catch (e) {
    throw e
  }

  let food = null
  try {
    food = await get(foodId)
  } catch (e) {
    throw e
  }

  newCredits = user.credits - (quantity * food.price)

  if (newCredits < 0) throw 'Error: user does not have enough credits to make this purchase.'

  const realFoodId = ObjectIdMongo(foodId)

  user.credits = newCredits
  if (!(realFoodId in user.foods)) {
    user.foods[realFoodId] = quantity
  } else {
    user.foods[realFoodId] += quantity
  }

  delete user._id

  let userCollection = await users()

  let updateId = ObjectIdMongo(userId)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: user })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not add new pet to user.'
  let changedUser = await usersJs.get(userId)
  return clean(changedUser)
}


module.exports = {
  add,
  get,
  buy,
  getAll
}
