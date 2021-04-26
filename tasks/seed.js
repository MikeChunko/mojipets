/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

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
  let jack = await userData.add({username: "jack", plaintextPassword: "sick_password", displayname:"greatest dude"})
  let child = await userData.add({username: "child", plaintextPassword: "yewllosub", displayname:"kid"})
  let elon = await userData.add({username: "muskrat", plaintextPassword: "teslaisPOG", displayname:"fuckin nerd"})
  let bezos = await userData.add({username: "jeffBillionaire", plaintextPassword: "ilovemoney"})
  let joey = await userData.add({username: "rattatauser", plaintextPassword: "rattataPower", displayname:"Yung Joe"})
  let whitney = await userData.add({username: "gym3johto", plaintextPassword: "normaltype", displayname:"miltank is poggers"})
  let brock = await userData.add({username: "gym1kanto", plaintextPassword: "dryingpan", displayname:"onix abuser"})
  let notch = await userData.add({username: "notch", plaintextPassword: "isuckandsmell", displayname:"racist twitter user"})
  let yu = await userData.add({username: "protag4", plaintextPassword: "izanagipicaro", displayname:"yu narukami"})
  elijah = await userData.modifyCredits( { userId: elijah._id, credits: 10000 } )
  jack = await userData.modifyCredits( { userId: jack._id, credits: 10000 } )
  child = await userData.modifyCredits( { userId: child._id, credits: 10000 } )
  elon = await userData.modifyCredits( { userId: elon._id, credits: 10000 } )
  bezos = await userData.modifyCredits( { userId: bezos._id, credits: 10000 } )
  joey = await userData.modifyCredits( { userId: joey._id, credits: 10000 } )
  whitney = await userData.modifyCredits( { userId: whitney._id, credits: 10000 } )
  brock = await userData.modifyCredits( { userId: brock._id, credits: 10000 } )
  notch = await userData.modifyCredits( { userId: notch._id, credits: 10000 } )
  yu = await userData.modifyCredits( { userId: yu._id, credits: 10000 } )
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
  let ratEmoji = { codepoint:"🐀", name:"rat", img:"resources/animals/rat.jpg" }
  let snowmanEmoji = { codepoint:"☃️", name:"snowman", img:"resources/animals/snowman.jpg" }
  let pigEmoji = { codepoint:"☃️", name:"pig", img:"resources/animals/pig.jpg" }
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
  let cat = await storePetData.add({emoji:catEmoji, price:100, rarity:1})
  let cow = await storePetData.add({emoji:cowEmoji, price:100, rarity:1})
  let ant = await storePetData.add({emoji:antEmoji, price:100, rarity:1})
  let caterpillar = await storePetData.add({emoji:caterpillarEmoji, price:100, rarity:1})
  let panda = await storePetData.add({emoji:pandaEmoji, price:200, rarity:2})
  let bear = await storePetData.add({emoji:bearEmoji, price:200, rarity:2})
  let bat = await storePetData.add({emoji:batEmoji, price:100, rarity:1})
  let fox = await storePetData.add({emoji:foxEmoji, price:100, rarity:1})
  let giraffe = await storePetData.add({emoji:giraffeEmoji, price:200, rarity:2})
  let hedgehog = await storePetData.add({emoji:hedgehogEmoji, price:100, rarity:1})
  let rat = await storePetData.add({emoji:ratEmoji, price:100, rarity:1})
  let pizza = await storeFoodData.add({emoji:pizzaEmoji, price:20})
  let pie = await storeFoodData.add({emoji:pieEmoji, price:30})
  let melon = await storeFoodData.add({emoji:melonEmoji, price:40})
  let mango = await storeFoodData.add({emoji:mangoEmoji, price:20})
  let meatOnBone = await storeFoodData.add({emoji:mobEmoji, price:26})
  let falaffel = await storeFoodData.add({emoji:falaffelEmoji, price:20})
  let bagel = await storeFoodData.add({emoji:bagelEmoji, price:10})
  let onigiri = await storeFoodData.add({emoji:onigiriEmoji, price:20})
  let donut = await storeFoodData.add({emoji:donutEmoji, price:5})
  let sushi = await storeFoodData.add({emoji:sushiEmoji, price:50})
  let sergio = await userPetData.add({owner:elijah._id, name:"sergio", emoji: catEmoji})
  let kowie = await userPetData.add({owner:elijah._id, name:"kowie", emoji: cowEmoji})
  let batty = await userPetData.add({owner:jack._id, name:"batty", emoji: batEmoji, price: 2500})
  let sonic = await userPetData.add({owner:child._id, name:"sonic", emoji: hedgehogEmoji})
  let bandit = await userPetData.add({owner:elon._id, name:"bandit", emoji: pandaEmoji})
  let girafarig = await userPetData.add({owner:bezos._id, name:"girafarig", emoji: giraffeEmoji})
  let rattata = await userPetData.add({owner:joey._id, name:"rattata", emoji: ratEmoji})
  let miltank = await userPetData.add({owner:whitney._id, name:"miltank", emoji: cowEmoji})
  let onix = await userPetData.add({owner:brock._id, name:"onix", emoji: caterpillarEmoji})
  let creeper = await userPetData.add({owner:notch._id, name:"creeper", emoji: pigEmoji})
  let jackFrost = await userPetData.add({owner:yu._id, name:"Jack Frost", emoji: snowmanEmoji})
  elijah = await storeFoodData.buy({userId: elijah._id, foodId: pizza._id, quantity: 20})
  jack = await storeFoodData.buy({userId: jack._id, foodId: pie._id, quantity: 20})
  child = await storeFoodData.buy({userId: child._id, foodId: melon._id, quantity: 20})
  elon = await storeFoodData.buy({userId: elon._id, foodId: mango._id, quantity: 20})
  bezos = await storeFoodData.buy({userId: bezos._id, foodId: meatOnBone._id, quantity: 20})
  joey = await storeFoodData.buy({userId: joey._id, foodId: falaffel._id, quantity: 20})
  whitney = await storeFoodData.buy({userId: whitney._id, foodId: bagel._id, quantity: 20})
  brock = await storeFoodData.buy({userId: brock._id, foodId: onigiri._id, quantity: 20})
  notch = await storeFoodData.buy({userId: notch._id, foodId: donut._id, quantity: 20})
  yu = await storeFoodData.buy({userId: yu._id, foodId: sushi._id, quantity: 20})
  await db.serverConfig.close();
}

main()
