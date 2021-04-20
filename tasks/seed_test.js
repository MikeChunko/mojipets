const express = require('express')
const router = express.Router()
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const storePetData = data.storePets
const userPetData = data.userPets
const userData = data.users
const storeFoodData = data.storeFood


async function main() {
    const db = await dbConnection();
    await db.dropDatabase();
    let elijah = await userData.add({username: "elijah", plaintextPassword: "fun9password", displayname:"greatest dude"})
    try {
        let elijah2 = await userData.add({username: "elijah", plaintextPassword: "fun9password", displayname:"greatest dude"})
    } catch (e) {
        console.log(e)
    }
    console.log(elijah)
    let jack = await userData.add({username: "jack", plaintextPassword: "sick_password", displayname:"greatest dude"})
    let child = await userData.add({username: "child", plaintextPassword: "yewllosub", displayname:"kid"})
    let catEmoji = { codepoint:"😸", name:"cat", img:"resources/animals/cat.jpg" }
    let pizzaEmoji = { codepoint:"🍕", name:"pizza", img:"resources/food/pizza.jpg" }
    let sergio = await userPetData.add({owner:elijah._id, name:"sergio", emoji: catEmoji})
    console.log(sergio)
    let cat = await storePetData.add({emoji:catEmoji, price:100, rarity:1})
    console.log(cat)
    let pizza = await storeFoodData.add({emoji:pizzaEmoji, price:20})
    console.log(pizza)
    await db.serverConfig.close();
}

main()