const bcrypt = require('bcrypt');
const saltRounds = 16;

async function hash_password(plaintextPassword) {
  return await bcrypt.hash(plaintextPassword, saltRounds);
}

module.exports = {
  hash_password
}
