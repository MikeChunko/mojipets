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
    let elijah = await userData.addUser("elijah", "fun9password", "greatest dude")
    try {
        let elijah2 = await userData.addUser("elijah", "xoxoxoxoxo", "greatest dude")
    } catch (e) {
        console.log(e)
    }
    let jack = await userData.addUser("jack", "nicepassword", "greatest dude")
    let child = await userData.addUser("child", "child@mail.com", "1234pass", "cool guy")
    let catEmoji = { codepoint:"😸", name:"cat", img:"resources/animals/cat.jpg" }
    let pizzaEmoji = { codepoint:"🍕", name:"pizza", img:"resources/food/pizza.jpg" }
    let sergio = await userPetData.addUserPet(elijah._id, "sergio", catEmoji)
    let cat = await storePetData.addStorePet(catEmoji, 100, 1)
    let pizza = await storeFoodData.addStoreFood(pizzaEmoji, 20)
    await db.serverConfig.close();
}

main()