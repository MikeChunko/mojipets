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
      bcrypt = require('bcrypt'),
      settings = require("../config.json"),
      saltRounds = settings.saltRounds,
      {
        isEmoji,
        isImg,
        isDate,
        clean
      } = require("../util");

async function hash_password(plaintextPassword) {
  return await bcrypt.hash(plaintextPassword, saltRounds);
}

function validPassword (pwdStr) {
  var pwdFormat = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$";
  if (pwdStr.match(pwdFormat)) { return true }
  return false
} // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a

async function add(body) {
  username = body.username
  plaintextPassword = body.plaintextPassword
  displayname = body.displayname
  emoji = body.pfp

  if (!username) throw 'Error: must provide the username of the user.'
  if (!plaintextPassword) throw 'Error: must provide a password for the user.'
  if (!displayname) { displayname = username }
  if (!emoji) {
    emoji = {codepoint: "😊", name: "smile", img: "/public/resources/pfp/smile.svg"}
  }
  if (typeof(username) != 'string') throw 'Error: name must be a string.'
  if (typeof(plaintextPassword) != 'string') throw 'Error: password must be a string.'
  if (typeof(displayname) != 'string') throw 'Error: password must be a string.'
  if (username.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'
  if (plaintextPassword.trim().length == 0) throw 'Error: password is either an empty string or just whitespace.'
  if (displayname.trim().length == 0) { displayname = username }
  if (typeof(emoji) != 'object') throw 'Error: pfp emoji must be an object.'
  if (!('codepoint' in emoji)) throw 'Error: pfp emoji object must have a codepoint.'
  if (!('name' in emoji)) throw 'Error: pfp emoji object must have a name.'
  if (!('img' in emoji)) throw 'Error: pfp emoji object must have a img.'
  if (typeof(emoji.name) != 'string') throw 'Error: pfp emoji name must be a string.'
  if (!isEmoji(emoji.codepoint)) throw 'Error: pfp emoji codepoint not an emoji.'
  if (!isImg(emoji.img)) throw 'Error: pfp emoji img not an img.'

  allUsers = await getAllUsers()
  for (i of allUsers) {
    if (i.username == username) {
      throw 'Error: username already taken.'
    }
  }

  const userCollection = await users()
  const passwordhash = await hash_password(plaintextPassword)

  let joinDate = new Date();

  const newUser = {
    username: username.trim().toLowerCase(),
    passwordhash: passwordhash,
    displayname: displayname.trim(),
    credits: 0, // change later maybe
    pfp: emoji,
    joinDate: joinDate,
    lastLogin: joinDate,
    friends: [],
    pets: [],
    favoritePets: [],
    foods: {}
  }

  let insertInfo = await userCollection.insertOne(newUser)
  if (insertInfo.insertedCount == 0) throw 'Error: could not add user.'
  const newId = insertInfo.insertedId
  const user = await get(newId.toString())
  return user
}

async function getAllUsers() {
  const userCollection = await users()
  const userArr = await userCollection.find({}).toArray()
  return userArr.map(clean)
}

async function get(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'

  const userCollection = await users()

  const user = await userCollection.findOne({ _id: ObjectID(id) })
  if (user === null) throw `No user could be found with the id '${id}'`
  return clean(user)
}

async function update(body) {
  uid = body.userId
  username = body.username
  displayname = body.displayname
  emoji = body.pfp
  if (!emoji) {
    emoji = {codepoint: "😊", name: "smile", img: "/public/resources/pfp/smile.svg"}
  }
  if (!uid) throw 'Error: uid not given.'
  if (!username) throw 'Error: must provide the username of the user.'
  if (!displayname) { displayname = username }
  if (typeof(uid) != "string") throw 'Error: type of uid not string.'
  if (typeof(username) != 'string') throw 'Error: name must be a string.'
  if (typeof(displayname) != 'string') throw 'Error: password must be a string.'
  if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'
  if (username.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'
  if (displayname.trim().length == 0) { displayname = username }
  if (typeof(emoji) != 'object') throw 'Error: pfp emoji must be an object.'
  if (!('codepoint' in emoji)) throw 'Error: pfp emoji object must have a codepoint.'
  if (!('name' in emoji)) throw 'Error: pfp emoji object must have a name.'
  if (!('img' in emoji)) throw 'Error: pfp emoji object must have a img.'
  if (typeof(emoji.name) != 'string') throw 'Error: pfp emoji name must be a string.'
  if (!isEmoji(emoji.codepoint)) throw 'Error: pfp emoji codepoint not an emoji.'
  if (!isImg(emoji.img)) throw 'Error: pfp emoji img not an img.'

  let userCollection = await users()

  let user = null
  try {
    user = await get(uid)
  } catch (e) {
    throw e
  }

  const newUser = {
    username: username.trim().toLowerCase(),
    passwordhash: user.passwordhash,
    displayname: displayname.trim(),
    credits: user.credits,
    pfp: emoji,
    joinDate: user.joinDate,
    lastLogin: user.lastLogin,
    friends: user.friends,
    pets: user.pets,
    favoritePets: user.favoritePets,
    foods: user.foods
  }

  let updateId = ObjectIdMongo(uid)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: newUser })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not update user.'
  let changedUser = await getUser(uid.toString())
  return changedUser
}

async function updatePassword(body) {
  let uid = body.userId
  let plaintextPassword = body.plaintextPassword

  if (!uid) throw 'Error: uid not given.'
  if (!plaintextPassword) throw 'Error: must provide a password for the user.'
  if (typeof(uid) != "string") throw 'Error: type of uid not string.'
  if (typeof(plaintextPassword) != 'string') throw 'Error: password must be a string.'
  if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'
  if (plaintextPassword.trim().length == 0) throw 'Error: password is either an empty string or just whitespace.'

  let userCollection = await users()

  let user = null
  try {
    user = await get(uid)
  } catch (e) {
    throw e
  }

  const passwordhash = await hash_password(plaintextPassword)

  const newUser = {
    username: user.username,
    passwordhash: passwordhash,
    displayname: user.displayname.trim(),
    credits: user.credits,
    pfp: user.pfp,
    joinDate: user.joinDate,
    lastLogin: user.lastLogin,
    friends: user.friends,
    pets: user.pets,
    favoritePets: user.favoritePets,
    foods: user.foods
  }

  let updateId = ObjectIdMongo(uid)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: newUser })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not update user.'
  let changedUser = await getUser(uid.toString())
  return changedUser
}

async function modifyCredits(body) {
  let uid = body.userId
  let credits = body.credits

  if (!uid) throw 'Error: uid not given.'
  if (!credits) throw 'Error: must provide a credits.'
  if (typeof(uid) != "string") throw 'Error: type of uid not string.'
  if (typeof(credits) != 'number') throw 'Error: credits must be a number.'
  if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'

  let user = null
  try {
    user = await get(uid)
  } catch (e) {
    throw e
  }

  // number of credits given can be positive or negative, however if negative and makes user go under 0, cannot perform operation.
  if (user.credits + credits <= 0) throw `Error: user does not have enough credits to deduct ${-credits}`

  const newUser = {
    username: user.username,
    passwordhash: user.passwordhash,
    displayname: user.displayname,
    credits: user.credits + credits,
    pfp: user.pfp,
    joinDate: user.joinDate,
    lastLogin: user.lastLogin,
    friends: user.friends,
    pets: user.pets,
    favoritePets: user.favoritePets,
    foods: user.foods
  }

  const userCollection = await users()

  let updateId = ObjectIdMongo(uid)

  const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: newUser })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not update user.'
  let changedUser = await get(uid.toString())
  return changedUser
}

async function makeFriends(body) {
  id1 = body.userId1
  id2 = body.userId2
  if (!id1) throw 'Error: userId1 not given.'
  if (typeof(id1) != "string") throw 'Error: type of userId1 not string.'
  if (id1.trim().length == 0) throw 'Error: userId1 is either an empty string or just whitespace.'
  if (!id2) throw 'Error: userId2 not given.'
  if (typeof(id2) != "string") throw 'Error: type of userId2 not string.'
  if (id2.trim().length == 0) throw 'Error: userId2 is either an empty string or just whitespace.'

  let user1 = null;
  let user2 = null;
  try {
    user1 = await get(id1)
  } catch (e) {
    throw e
  }
  try {
    user2 = await get(id2)
  } catch (e) {
    throw e
  }

  let objId1 = ObjectIdMongo(id1)
  let objId2 = ObjectIdMongo(id2)
  console.log(user1)
  console.log(user2)
  if (user2.friends.includes(objId1) && user1.friends.includes(objId2)) throw 'Error: users are already friends.'
  const userCollection = await users()
  user1.friends.push(objId2)
  user2.friends.push(objId1)
  delete user1._id
  delete user2._id
  const updateInfo1 = await userCollection.updateOne({ _id: objId1 }, { $set: user1 })
  if (updateInfo1.modifiedCount == 0) throw 'Error: could not update user1.'
  const updateInfo2 = await userCollection.updateOne({ _id: objId2 }, { $set: user2 })
  if (updateInfo2.modifiedCount == 0) throw 'Error: could not update user2.'
  return [await get(id1), await get(id2)]
}

async function getDeadPets(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let user = null;
  try {
    user = await get(id)
  } catch (e) {
    throw e
  }
  let currentDateTimestamp = new Date().getTime()
  let deadPets = []
  for (pet of user.pets) {
    let weekPastFeedTime = pet.health.getTime() + (9 * 24 * 60 * 60 * 1000) // days * hrs * minutes * seconds * ms
    if (currentDateTimestamp > weekPastFeedTime) {
      deadPets.push(pet)
    }
  }
  return deadPets
}

async function getLivingPets(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let user = null;
  try {
    user = await get(id)
  } catch (e) {
    throw e
  }
  let currentDateTimestamp = new Date().getTime()
  let livingPets = []
  for (pet of user.pets) {
    let weekPastFeedTime = pet.health.getTime() + (9 * 24 * 60 * 60 * 1000) // days * hrs * minutes * seconds * ms
    if (currentDateTimestamp < weekPastFeedTime) {
      livingPets.push(pet)
    }
  }
  return livingPets
}

async function updateLoginTime(id) {
  if (!id) throw 'Error: id not given.'
  if (typeof(id) != "string") throw 'Error: type of id not string.'
  if (id.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
  let user = null;
  try {
    user = await get(id)
  } catch (e) {
    throw e
  }
  let currentDateTimestamp = new Date()
  const userCollection = await users()
  user.lastLogin = currentDateTimestamp
  let objId = ObjectIdMongo(id)
  delete user._id
  const updateInfo = await userCollection.updateOne({ _id: objId }, { $set: user })
  if (updateInfo.modifiedCount == 0) throw 'Error: could not update user1.'
  return await get(id)
}

module.exports = {
  add,
  get,
  getAllUsers,
  update,
  updatePassword,
  modifyCredits,
  makeFriends,
  getDeadPets,
  getLivingPets,
  updateLoginTime
}
