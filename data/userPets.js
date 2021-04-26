const { ObjectID } = require('bson');
ObjectIdMongo = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
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

async function getPetsFromUser(id) {
  let user = null
  try { user = await usersJs.get(id) }
  catch (e) { throw e }
  return user.pets.map(clean)
}

module.exports = {
  add,
  get,
  getPetsFromUser
}
