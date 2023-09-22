
const express = require('express');
const router = express.Router();
const UserRegistrationModel  = require('../models/Registration');
const bcryptjs = require('bcryptjs');

router.get('/logout', (req, res) => {
    res.clearCookie("jwt", {path: '/'});
    res.status(200).send("User successfully logged out")
  });

// *************Login Form****************//
router.post('/login', async (req, res) => {
    try {
      const LoginID = req.body.LoginID;
      const Password = req.body.Password;
      console.log(req.body);
  
      let user = ''; // Initialize user as null
  
      user = await UserRegistrationModel.findOne({ LoginID: LoginID });
  
      if (user) {
        console.log('User found:', user);
        const isMatch = await bcryptjs.compare(Password, user.Password);
        console.log('isMatch:', isMatch);
  
        if (isMatch) {
          const token = await user.generateToken();
        
          // console.log('Generated token:', token);
          // console.log('User Object:', user); // Log the user object here to see if _id is present
        
          res.cookie("jwt", token, {
            expires: new Date(Date.now() + 18000),
            httpOnly: true,
          });
        
          res.json({ Role: user.Role, token: token, Id: user._id });
        }
        }} catch (error) {
      console.error(error);
      res.status(400).send("Invalid Credentials");
    }}
  );
  


module.exports = router;