const { ObjectID } = require('bson');
ObjectIdMongo = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const { users } = require('../config/mongoCollections');
const bcrypt_pass = require('../tasks/bcrypt_pass')

function validPassword (pwdStr) {
    var pwdFormat = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$";
    if (pwdStr.match(pwdFormat)) { return true }
    return false
} // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a

function clean(obj) {
    obj._id = obj._id.toString()
    return obj
}

async function add(body) {
    username = body.username
    plaintextPassword = body.plaintextPassword
    displayname = body.displayname
    if (!username) throw 'Error: must provide the username of the user.'
    if (!plaintextPassword) throw 'Error: must provide a password for the user.'
    if (!displayname) { displayname = username }
    
    if (typeof(username) != 'string') throw 'Error: name must be a string.'
    if (typeof(plaintextPassword) != 'string') throw 'Error: email must be a string.'
    if (typeof(displayname) != 'string') throw 'Error: password must be a string.'

    if (username.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'
    if (plaintextPassword.trim().length == 0) throw 'Error: passeword is either an empty string or just whitespace.'
    if (displayname.trim().length == 0) { displayname = username }

    allUsers = await getAllUsers()
    for (i of allUsers) {
        if (i.username == username) {
            throw 'Error: username already taken.'
        }
    }
    
    const userCollection = await users()
    const passwordhash = await bcrypt_pass.hash_password(plaintextPassword)

    newUser = {
        username: username.trim(),
        passwordhash: passwordhash,
        displayname: displayname.trim(),
        credits: 0, // change later maybe
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

async function update(uid, username, plaintextPassword, displayname) {
    if (!uid) throw 'Error: uid not given.'
    if (!username) throw 'Error: must provide the username of the user.'
    if (!plaintextPassword) throw 'Error: must provide a password for the user.'
    if (!displayname) { displayname = username }

    if (typeof(uid) != "string") throw 'Error: type of uid not string.'
    if (typeof(username) != 'string') throw 'Error: name must be a string.'
    if (typeof(plaintextPassword) != 'string') throw 'Error: email must be a string.'
    if (typeof(displayname) != 'string') throw 'Error: password must be a string.'

    if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'
    if (username.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'
    if (plaintextPassword.trim().length == 0) throw 'Error: passeword is either an empty string or just whitespace.'
    if (displayname.trim().length == 0) { displayname = username }
    
    
    let userCollection = await users()

    let user = null
    try {
        user = await getUser(uid)
    } catch (e) {
        throw e
    }

    newUser = {
        username: username.trim(),
        passwordhash: passwordhash,
        displayname: displayname.trim(),
        credits: user.credits,
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

module.exports = {
    add,
    get,
    getAllUsers,
    update
}