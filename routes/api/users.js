const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

//User model
const User = require('../../models/User');

/*
// @route  GET api/users
// @desc   Test route
// @access Public  
router.get('/', (req, res) => res.send('User route'));
*/

// @route  POST api/users
// @desc   Register User
// @access Public  
router.post('/', 
[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid Email').isEmail(),
  check('password', 'Please enter password of 6 or more charaters').isLength({min: 6})
],
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {

     // If user already registered
     let user = await User.findOne({ email });

     if(user){
       return res.status(400).json({ errors: [{ msg : 'User already exist' }]});
     }

    // Get users gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })
    
    user = new User({
      name,
      email,
      avatar,
      password
    })
    
    // Encrypt password

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);
    
    await user.save(); 
   
    // Return jsonwebtoken
    res.send('User registered');
  }
  catch(err){
     console.error(err.message);
     res.status(500).send('Server error');
  } 
}
);


module.exports = router;