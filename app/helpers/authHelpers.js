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

//req.user is equal to the token
//req.user can now be used in every route where auth is used as middleware
//req.user._id = user email (which is unique) 
//this can be used throughout the routes now to identify user's locations
const auth = (req, res, next) => {
   const token = req.header('auth-token');
   if(!token) {
      return res.status(401).send('Please login to view resources')
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