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
    // try {
    //     let elijah2 = await userData.add({username: "elijah", plaintextPassword: "fun9password", displayname:"greatest dude"})
    // } catch (e) {
    //     console.log(e)
    // }
    console.log(elijah)
    // let jack = await userData.add({username: "jack", plaintextPassword: "sick_password", displayname:"greatest dude"})
    // let child = await userData.add({username: "child", plaintextPassword: "yewllosub", displayname:"kid"})
    let catEmoji = { codepoint:"😸", name:"cat", img:"resources/animals/cat.jpg" }
    let cowEmoji = { codepoint:"🐮", name:"cow", img:"resources/animals/cow.jpg" }
    let antEmoji = { codepoint:"🐜", name:"ant", img:"resources/animals/ant.jpg" }
    let caterpillarEmoji = { codepoint:"🐛", name:"caterpillar", img:"resources/animals/caterpillar.jpg" }
    let pandaEmoji = { codepoint:"🐼", name:"panda", img:"resources/animals/panda.jpg" }
    let batEmoji = { codepoint:"🦇", name:"bat", img:"resources/animals/bat.jpg" }
    let bearEmoji = { codepoint:"🐻", name:"bear", img:"resources/animals/bear.jpg" }
    let foxEmoji = { codepoint:"🦊", name:"fox", img:"resources/animals/fox.jpg" }
    let giraffeEmoji = { codepoint:"🦒", name:"giraffe", img:"resources/animals/giraffe.jpg" }
    let hedgehogEmoji = { codepoint:"🦔", name:"hedgehog", img:"resources/animals/hedgehog.jpg" }
    
    let pizzaEmoji = { codepoint:"🍕", name:"pizza", img:"resources/food/pizza.jpg" }
    let pieEmoji = { codepoint:"🥧", name:"pie", img:"resources/food/pie.jpg" }
    let melonEmoji = { codepoint:"🍈", name:"melon", img:"resources/food/melon.jpg" }
    let mangoEmoji = { codepoint:"🥭", name:"mango", img:"resources/food/mango.jpg" }
    let mobEmoji = { codepoint:"🍖", name:"meat on bone", img:"resources/food/meat_on_bone.jpg" }
    let falaffelEmoji = { codepoint:"🧆", name:"falaffel", img:"resources/food/falaffel.jpg" }
    let bagelEmoji = { codepoint:"🥯", name:"bagel", img:"resources/food/bagel.jpg" }
    let onigiriEmoji = { codepoint:"🍙", name:"onigiri", img:"resources/food/onigiri.jpg" }
    let donutEmoji = { codepoint:"🍩", name:"donut", img:"resources/food/donut.jpg" }
    let sushiEmoji = { codepoint:"🍣", name:"sushi", img:"resources/food/sushi.jpg" }

    let sergio = await userPetData.add({owner:elijah._id, name:"sergio", emoji: catEmoji})
    let kowie = await userPetData.add({owner:elijah._id, name:"kowie", emoji: cowEmoji})

    elijah = await userData.modifyCredits( { userId: elijah._id, credits: 10000 } ) 

    let batty = await userPetData.add({owner:elijah._id, name:"batty", emoji: batEmoji, price: 2500})


    console.log(sergio)
    let cat = await storePetData.add({emoji:catEmoji, price:100, rarity:1})
    console.log(cat)
    let pizza = await storeFoodData.add({emoji:pizzaEmoji, price:20})
    elijah = await storeFoodData.buy({userId: elijah._id, foodId: pizza._id, quantity: 20})
    elijah = await storeFoodData.buy({userId: elijah._id, foodId: pizza._id, quantity: 1})
    console.log(pizza)
    let allUsers = await userData.getAllUsers()
    console.log(allUsers)
    let elijahPets = await userPetData.getPetsFromUser(elijah._id)
    console.log(elijahPets)
    await db.serverConfig.close();
}

main()
