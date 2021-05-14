/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const express = require('express');
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const storePetData = data.storePets;
const userPetData = data.userPets;
const userData = data.users;
const storeFoodData = data.storeFood;
const storeToyData = data.storeToys;


async function main() {
  const db = await dbConnection();
  await db.dropDatabase();
  // emoji objects
  let catEmoji = { codepoint:"😸", name:"cat", img:"/public/resources/pets/cat.svg" }
  let cowEmoji = { codepoint:"🐮", name:"cow", img:"/public/resources/pets/cow.svg" }
  let antEmoji = { codepoint:"🐜", name:"ant", img:"/public/resources/pets/ant.svg" }
  let caterpillarEmoji = { codepoint:"🐛", name:"caterpillar", img:"/public/resources/pets/caterpillar.svg" }
  let pandaEmoji = { codepoint:"🐼", name:"panda", img:"/public/resources/pets/panda.svg" }
  let batEmoji = { codepoint:"🦇", name:"bat", img:"/public/resources/pets/bat.svg" }
  let bearEmoji = { codepoint:"🐻", name:"bear", img:"/public/resources/pets/bear.svg" }
  let foxEmoji = { codepoint:"🦊", name:"fox", img:"/public/resources/pets/fox.svg" }
  let giraffeEmoji = { codepoint:"🦒", name:"giraffe", img:"/public/resources/pets/giraffe.svg" }
  let hedgehogEmoji = { codepoint:"🦔", name:"hedgehog", img:"/public/resources/pets/hedgehog.svg" }
  let ratEmoji = { codepoint:"🐀", name:"rat", img:"/public/resources/pets/rat.svg" }
  let snowmanEmoji = { codepoint:"☃️", name:"snowman", img:"/public/resources/pets/snowman.svg" }
  let pigEmoji = { codepoint:"🐷", name:"pig", img:"/public/resources/pets/pig.svg" }
  let dragonEmoji = { codepoint:"🐉", name:"dragon", img:"/public/resources/pets/dragon.svg" }
  let duckEmoji = { codepoint:"🐍", name:"duck", img:"/public/resources/pets/duck.svg" }
  let frogEmoji = { codepoint:"🐸", name:"frog", img:"/public/resources/pets/frog.svg" }
  let invaderEmoji = { codepoint:"👾", name:"invader", img:"/public/resources/pets/invader.svg" }
  let microbeEmoji = { codepoint:"🦠", name:"microbe", img:"/public/resources/pets/microbe.svg" }
  let penguinEmoji = { codepoint:"🐧", name:"penguin", img:"/public/resources/pets/penguin.svg" }
  let scorpionEmoji = { codepoint:"🦂", name:"scorpion", img:"/public/resources/pets/scorpion.svg" }
  let squidEmoji = { codepoint:"🦑", name:"squid", img:"/public/resources/pets/squid.svg" }
  let turtleEmoji = { codepoint:"🐢", name:"turtle", img:"/public/resources/pets/turtle.svg" }
  let unicornEmoji = { codepoint:"🦄", name:"unicorn", img:"/public/resources/pets/unicorn.svg" }
  let whaleEmoji = { codepoint:"🐳", name:"whale", img:"/public/resources/pets/whale.svg" }
  let pizzaEmoji = { codepoint:"🍕", name:"pizza", img:"/public/resources/food/pizza.svg" }
  let pieEmoji = { codepoint:"🥧", name:"pie", img:"/public/resources/food/pie.svg" }
  let melonEmoji = { codepoint:"🍈", name:"melon", img:"/public/resources/food/melon.svg" }
  let mangoEmoji = { codepoint:"🥭", name:"mango", img:"/public/resources/food/mango.svg" }
  let mobEmoji = { codepoint:"🍖", name:"meat on bone", img:"/public/resources/food/meat_on_bone.svg" }
  let falaffelEmoji = { codepoint:"🧆", name:"falaffel", img:"/public/resources/food/falaffel.svg" }
  let bagelEmoji = { codepoint:"🥯", name:"bagel", img:"/public/resources/food/bagel.svg" }
  let onigiriEmoji = { codepoint:"🍙", name:"onigiri", img:"/public/resources/food/onigiri.svg" }
  let donutEmoji = { codepoint:"🍩", name:"donut", img:"/public/resources/food/donut.svg" }
  let sushiEmoji = { codepoint:"🍣", name:"sushi", img:"/public/resources/food/sushi.svg" }
  let steakEmoji = { codepoint:"🥩", name:"steak", img:"/public/resources/food/steak.svg" }
  let strawberryEmoji = { codepoint:"🍓", name:"strawberry", img:"/public/resources/food/strawberry.svg" }
  let kiwiEmoji = { codepoint:"🥝", name:"kiwi", img:"/public/resources/food/kiwi.svg" }
  let broccoliEmoji = { codepoint:"🥦", name:"broccoli", img:"/public/resources/food/broccoli.svg" }
  let basketballEmoji = { codepoint:"🏀", name:"basketball", img:"/public/resources/toys/basketball.svg" }
  let balloonEmoji = { codepoint:"🎈", name:"balloon", img:"/public/resources/toys/balloon.svg" }
  let baseballEmoji = { codepoint:"⚾", name:"baseball", img:"/public/resources/toys/baseball.svg" }
  let fireworksEmoji = { codepoint:"🎉", name:"popper", img:"/public/resources/toys/popper.svg" }
  let confettiEmoji = { codepoint:"🎊", name:"confetti", img:"/public/resources/toys/confetti.svg" }
  let paletteEmoji = { codepoint:"🎨", name:"palette", img:"/public/resources/toys/palette.svg" }
  let threadEmoji = { codepoint:"🧶", name:"yarn", img:"/public/resources/toys/yarn.svg" }
  let volleyballEmoji = { codepoint:"🏐", name:"volleyball", img:"/public/resources/toys/volleyball.svg" }
  let yoyoEmoji = { codepoint:"🪀", name:"yo-yo", img:"/public/resources/toys/yo-yo.svg" }
  let soccerballEmoji = { codepoint:"⚽", name:"soccer ball", img:"/public/resources/toys/soccerball.svg" }
  // food store
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
  let broccoli = await storeFoodData.add({emoji:broccoliEmoji, price:20})
  let kiwi = await storeFoodData.add({emoji:kiwiEmoji, price:25})
  let steak = await storeFoodData.add({emoji:steakEmoji, price:50})
  let strawberry = await storeFoodData.add({emoji:strawberryEmoji, price:15})
  // pet store
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
  let dragon = await storePetData.add({emoji:dragonEmoji, price:300, rarity:4})
  let duck = await storePetData.add({emoji:duckEmoji, price:100, rarity:1})
  let frog = await storePetData.add({emoji:frogEmoji, price:999, rarity:5})
  let invader = await storePetData.add({emoji:invaderEmoji, price:350, rarity:4})
  let microbe = await storePetData.add({emoji:microbeEmoji, price:270, rarity:4})
  let penguin = await storePetData.add({emoji:penguinEmoji, price:100, rarity:1})
  let scorpion = await storePetData.add({emoji:scorpionEmoji, price:100, rarity:1})
  let squid = await storePetData.add({emoji:squidEmoji, price:100, rarity:1})
  let turtle = await storePetData.add({emoji:turtleEmoji, price:100, rarity:1})
  let unicorn = await storePetData.add({emoji:unicornEmoji, price:300, rarity:4})
  let whale = await storePetData.add({emoji:whaleEmoji, price:100, rarity:1})
  let rat = await storePetData.add({emoji:ratEmoji, price:100, rarity:1})
  // toy store
  let basketball = await storeToyData.add({emoji:basketballEmoji, price:20})
  let balloon = await storeToyData.add({emoji:balloonEmoji, price:15})
  let baseball = await storeToyData.add({emoji:baseballEmoji, price:18})
  let fireworks = await storeToyData.add({emoji:fireworksEmoji, price:30})
  let confetti = await storeToyData.add({emoji:confettiEmoji, price:25})
  let palette = await storeToyData.add({emoji:paletteEmoji, price:22})
  let thread = await storeToyData.add({emoji:threadEmoji, price:10})
  let volleyball = await storeToyData.add({emoji:volleyballEmoji, price:19})
  let yoyo = await storeToyData.add({emoji:yoyoEmoji, price:17})
  let soccerball = await storeToyData.add({emoji:soccerballEmoji, price:20})
  // users
  let elijah = await userData.add({username: "elijah", plaintextPassword: "fun9password", displayname:"greatest dude"})
  let jack = await userData.add({username: "jack", plaintextPassword: "sick_password", displayname:"greatest dude"})
  let child = await userData.add({username: "child", plaintextPassword: "yewllosub", displayname:"kid"})
  let elon = await userData.add({username: "muskrat", plaintextPassword: "teslaisPOG", displayname:"fuckin nerd"})
  let bezos = await userData.add({username: "jeffBillionaire", plaintextPassword: "ilovemoney"})
  let joey = await userData.add({username: "rattatauser", plaintextPassword: "rattataPower", displayname:"Yung Joe"})
  let whitney = await userData.add({username: "gym3johto", plaintextPassword: "normaltype", displayname:"miltank is poggers"})
  let brock = await userData.add({username: "gym1kanto", plaintextPassword: "dryingpan", displayname:"onix abuser"})
  let yu = await userData.add({username: "protag4", plaintextPassword: "izanagipicaro", displayname:"yu narukami"})
  // user friend data
  await userData.makeFriends({userId1: elijah._id, userId2: yu._id})
  await userData.makeFriends({userId1: brock._id, userId2: whitney._id})
  await userData.makeFriends({userId1: joey._id, userId2: whitney._id})
  await userData.makeFriends({userId1: elon._id, userId2: bezos._id})
  // user balance
  elijah = await userData.modifyCredits( { userId: elijah._id, credits: 10000 } )
  jack = await userData.modifyCredits( { userId: jack._id, credits: 10000 } )
  child = await userData.modifyCredits( { userId: child._id, credits: 10000 } )
  elon = await userData.modifyCredits( { userId: elon._id, credits: 10000 } )
  bezos = await userData.modifyCredits( { userId: bezos._id, credits: 10000 } )
  joey = await userData.modifyCredits( { userId: joey._id, credits: 10000 } )
  whitney = await userData.modifyCredits( { userId: whitney._id, credits: 10000 } )
  brock = await userData.modifyCredits( { userId: brock._id, credits: 10000 } )
  yu = await userData.modifyCredits( { userId: yu._id, credits: 10000 } )
  // userpets
  let sergio = await userPetData.add({owner:elijah._id, name:"sergio", emoji: catEmoji})
  let kowie = await userPetData.add({owner:elijah._id, name:"kowie", emoji: cowEmoji})
  let batty = await userPetData.add({owner:jack._id, name:"batty", emoji: batEmoji, price: 2500})
  let sonic = await userPetData.add({owner:child._id, name:"sonic", emoji: hedgehogEmoji})
  let bandit = await userPetData.add({owner:elon._id, name:"bandit", emoji: pandaEmoji})
  let girafarig = await userPetData.add({owner:bezos._id, name:"girafarig", emoji: giraffeEmoji})
  let rattata = await userPetData.add({owner:joey._id, name:"rattata", emoji: ratEmoji})
  let miltank = await userPetData.add({owner:whitney._id, name:"miltank", emoji: cowEmoji})
  let tauros = await userPetData.add({owner:whitney._id, name:"tauros", emoji: cowEmoji})
  let ursarig = await userPetData.add({owner:whitney._id, name:"ursarig", emoji: bearEmoji})
  let rattata_1 = await userPetData.add({owner:whitney._id, name:"rattata_1", emoji: ratEmoji})
  let rattata_2 = await userPetData.add({owner:whitney._id, name:"rattata_2", emoji: ratEmoji})
  let rattata_3 = await userPetData.add({owner:whitney._id, name:"rattata_3", emoji: ratEmoji})
  let rattata_4 = await userPetData.add({owner:whitney._id, name:"rattata_4", emoji: ratEmoji})
  let onix = await userPetData.add({owner:brock._id, name:"onix", emoji: caterpillarEmoji})
  let jackFrost = await userPetData.add({owner:yu._id, name:"Jack Frost", emoji: snowmanEmoji})
  // user favorites
  let favData = await userPetData.favorite(miltank._id)
  favData = await userPetData.favorite(onix._id)
  favData = await userPetData.favorite(tauros._id)
  favData = await userPetData.favorite(ursarig._id)
  favData = await userPetData.favorite(rattata_1._id)
  favData = await userPetData.favorite(rattata_2._id)
  favData = await userPetData.favorite(rattata_3._id)
  favData = await userPetData.favorite(rattata_4._id)
  favData = await userPetData.favorite(sonic._id)
  favData = await userPetData.unfavorite(sonic._id)
  // user inventories - food
  elijah = await storeFoodData.buy({userId: elijah._id, foodId: pizza._id, quantity: 20})
  jack = await storeFoodData.buy({userId: jack._id, foodId: pie._id, quantity: 20})
  child = await storeFoodData.buy({userId: child._id, foodId: melon._id, quantity: 20})
  elon = await storeFoodData.buy({userId: elon._id, foodId: mango._id, quantity: 20})
  bezos = await storeFoodData.buy({userId: bezos._id, foodId: meatOnBone._id, quantity: 20})
  joey = await storeFoodData.buy({userId: joey._id, foodId: falaffel._id, quantity: 20})
  whitney = await storeFoodData.buy({userId: whitney._id, foodId: bagel._id, quantity: 20})
  brock = await storeFoodData.buy({userId: brock._id, foodId: onigiri._id, quantity: 20})
  yu = await storeFoodData.buy({userId: yu._id, foodId: sushi._id, quantity: 20})
  // user inventories - toys
  elijah = await storeToyData.buy({userId: elijah._id, toyId: yoyo._id, quantity: 20})
  jack = await storeToyData.buy({userId: jack._id, toyId: balloon._id, quantity: 20})
  child = await storeToyData.buy({userId: child._id, toyId: baseball._id, quantity: 20})
  elon = await storeToyData.buy({userId: elon._id, toyId: fireworks._id, quantity: 20})
  bezos = await storeToyData.buy({userId: bezos._id, toyId: confetti._id, quantity: 20})
  joey = await storeToyData.buy({userId: joey._id, toyId: palette._id, quantity: 20})
  whitney = await storeToyData.buy({userId: whitney._id, toyId: thread._id, quantity: 20})
  brock = await storeToyData.buy({userId: brock._id, toyId: volleyball._id, quantity: 20})
  yu = await storeToyData.buy({userId: yu._id, toyId: soccerball._id, quantity: 20})
  // idk
  let hermit = await storePetData.buy({userId: yu._id, petId: fox._id, petName: "hermit"})

  await db.serverConfig.close();
}

main()
