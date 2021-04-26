/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const { ObjectID } = require('bson');
ObjectIdMongo = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const { storeFood } = require('../config/mongoCollections');
const { users } = require('../config/mongoCollections');
const usersJs = require('./users')

function isEmoji(emoji) {
  return /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g.test(emoji)
} // https://stackoverflow.com/questions/18862256/how-to-detect-emoji-using-javascript

function isImg(img) {
  return /.(jpeg|jpg|png|gif|bmp|svg)/.test(img)
}

function isDate(d) {
  if (!d || !(d instanceof Date)) return false
  return true
}

function clean(obj) {
  obj._id = obj._id.toString()
  return obj
}

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
  return food
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

  // const realFoodId = ObjectIdMongo(foodId)

  user.credits = newCredits
  if (!(foodId in user.foods)) {
    user.foods[foodId] = quantity
  } else {
    user.foods[foodId] += quantity
  }

  delete user._id

  let userCollection = await users()

  let updateId = ObjectIdMongo(userId)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: user })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not add new pet to user.'
  let changedUser = await usersJs.get(userId)
  return changedUser
}


module.exports = {
  add,
  get,
  buy
}
