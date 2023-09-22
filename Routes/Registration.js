const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authentication');
const UserRegistrationModel = require('../models/Registration');

router.get('/change-password/:Id', authenticate, async(req, res) => {
    try {
        const userId = req.params.Id; // Retrieve the user ID from the URL
        console.log('Received userId:', userId);
        const { oldPassword, newPassword } = req.body; // Destructure old and new passwords
        console.log('Received request body:', req.body);
    
        // Find the user by their ID
        const user = await UserRegistrationModel.findById(userId);
    
        // Verify old password and update the new password
        const passwordMatch = await bcryptjs.compare(oldPassword, user.Password);
    
        console.log('isMatch:', passwordMatch);
        if (!passwordMatch) {
          return res.status(400).json({ message: 'Old password is incorrect' });
        }
    
        if (typeof newPassword !== 'string' || newPassword.length === 0) {
          return res.status(400).json({ message: 'New password is invalid' });
        }
    
        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
        // Update the user's password with the hashed password
        user.Password = hashedPassword;
        await user.save();
    
        res.json({ message: 'Password is successfully updated' });
      } catch (error) {
        console.log('Password change:', error);
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
})

module.exports = router;