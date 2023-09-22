const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserRegistrationSchema = new mongoose.Schema({
    LoginID: { type: String, unique: true, required: true}, 
    Name: {type: String, required: true},
    Email: { type: String, unique: true, required: true},
    ContactNo: {type: String, required: true},
    Password:{type: String, required: true},
    ConfirmPassword: {type: String, required: true},
    Role: {type:String, required: true},
    tokens: [
      {
        token: {
          type: String,
          required: true,
        }
      } 
    ],
    studentProfile: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile', 
        
      }],
    jobPost: [{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'JobPost',
      
    }]
});

UserRegistrationSchema.pre('save', async function(next){
  if(this.isModified('Password')){
    this.Password = bcryptjs.hashSync(this.Password, 10);
    if(this.isModified('ConfirmPassword')){
      this.ConfirmPassword = bcryptjs.hashSync(this.ConfirmPassword, 10);
    }
  }
  next();
}); 

// Generate token to verify user
UserRegistrationSchema.methods.generateToken = async function () {
  let retries = 3; // Number of retries
  while (retries > 0) {
    try {
      let generatedToken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
        expiresIn: '1d',
      });
      this.tokens = this.tokens.concat({ token: generatedToken });
      await this.save();
      return generatedToken;
    } catch (error) {
      // Check if the error is a VersionError and there are retries left
      if (error.name === 'VersionError' && retries > 0) {
        // Reload the document from the database and retry
        this.constructor.findById(this._id, (err, doc) => {
          if (err) throw err;
          if (!doc) {
            throw new Error('Document not found');
          }
          // Update the current instance with the reloaded document
          Object.assign(this, doc);
        });
        retries--;
      } else {
        throw error; // Throw other errors
      }
    }
  }
  throw new Error('Max retries reached'); // Handle if retries are exhausted
};




const UserRegistrationModel = new  mongoose.model('User', UserRegistrationSchema);


module.exports = UserRegistrationModel;
