const bcrypt = require('bcryptjs');

const loginAuth = async (password) => {
   const hashedPassword = await bcrypt.hash(password, 8);
   return hashedPassword;
}

module.exports = loginAuth;