const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword;
}

const comparePass = async (plainTextPass, hashedPass) => {
   const validPass = await bcrypt.compareSync(plainTextPass, hashedPass);
   return validPass;
}

module.exports = {
   hashPassword,
   comparePass
};