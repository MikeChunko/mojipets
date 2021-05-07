/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const cloneDeep = require("lodash.clonedeep");

/**
 * helper functions to remove sensitive fields from objects on return
 **/
const protect = {
  user: {
    // user is logged in, show private info
    showSensitive: (user) => {
      user_ = cloneDeep(user);
      delete user_.passwordhash
      return user_
    },

    // user is not logged in, only show public info
    hideSensitive: (user) => {
      user_ = cloneDeep(user)
      delete user_.passwordhash
      delete user_.friends
      delete user_.pets
      delete user_.credits
      delete user_.foods

      // remaining fields: username, pfp, displayname, favoritePets, joinDate
      return user_
    }
  },
  pet: {
    // pet owner is logged in, show private info
    showSensitive: (pet) => {
      pet_ = cloneDeep(pet)
      delete pet_.interactions
      return pet_
    },

    // pet owner is not logged in, only show public info
    hideSensitive: (pet) => {
      pet_ = cloneDeep(pet)
      delete pet_.interactions
      delete pet_.happiness
      delete pet_.health

      // remaining fields: name, birthday, emoji
      return pet_
    }
  }
}

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

// Convert a Date object to MM/DD/YY format
function dateToMMDDYY(date) {
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getYear() - 100}`;
}

module.exports = {
    protect,
    isEmoji,
    isImg,
    isDate,
    clean,
    dateToMMDDYY
};
