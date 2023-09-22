const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const RegistrationSchema = new mongoose.Schema({
  LoginID: { type: String, unique: true, required: true },
  CompanyName: {type: String, unique: true, required: "Company name already registered"},
  Industry: {type: String, required: true},
  HRName: {type: String, required: true},
  CompanyEmail: {type: String, required: true},
  ContactNo: {type: String, required: true},
  WebsiteLink: {type: String, required: true},
  AboutCompany: {type: String, required: true},
  Password: {type: String, required: true},
  ConfirmPassword: {type: String, required: true},
  role: {type: String},
  tokens: [
    {
      tokens: {
        type: String,
        required: true
      }
    }
  ]
});

// Hahing password to secure
RegistrationSchema.pre('save', async function(next){
  if(this.isModified('Password')){
    this.Password = bcryptjs.hashSync(this.Password, 10)
  }
  next();
}); 

// Generate token to verify user
RegistrationSchema.methods.generateToken = async function(){
  try{
    let generatedToken = jwt.sign({_id : this._id} , process.env.SECRET_KEY);
    this.tokens = this.concat({token : generatedToken});
    await this.save();
    return generatedToken;
  }
  catch (error){
    console.log(error)
  }
}


const ComRegistrationModel = new  mongoose.model('Company', RegistrationSchema);
module.exports = ComRegistrationModel;

