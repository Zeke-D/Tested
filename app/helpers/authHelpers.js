const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword;
}

const comparePass = async (plainTextPass, hashedPass) => {
   const validPass = await bcrypt.compareSync(plainTextPass, hashedPass);
   return validPass;
}

const auth = (req, res, next) => {
   const token = req.header('auth-token');
   if(!token) {
      return res.status(401).send('Access denied')
   }

   try{
      const verified = jwt.verify(token, process.env.TOKEN);
      req.user = verified;
      next()
   }catch(e) {
      res.status(400).send(e)
   }
}

module.exports = {
   hashPassword,
   comparePass,
   auth
};