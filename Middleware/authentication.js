


const jwt = require('jsonwebtoken');
const UserRegistrationModel = require('../models/Registration');

const authenticate = async (req, res, next) => {
  const cookies = req.cookies;
  console.log("cookies", cookies);

  const token = cookies.jwt;
  console.log("token", token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized user' });
  }
  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Verification successful", verifyToken);

    // Fetch the user from the database using the user ID in the token
    const user = await UserRegistrationModel.findById(verifyToken._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set req.user to the user object
    req.user = user;
    // console.log("user:", user)

    // Check if the user has a student profile associated with them
    if (user.studentProfile) {
      // Set req.studentProfileId to the student profile ID
      req.studentProfileId = user.studentProfile;
    }
    
    // Set req.userRole if needed
    const userRole = verifyToken.Role;
    req.userRole = userRole;
    
    next();
  } catch (error) {
    console.error('Authorization error from server side', error);
    return res.status(401).json({ message: 'Authorization failed' });
  }
};

module.exports = authenticate;
