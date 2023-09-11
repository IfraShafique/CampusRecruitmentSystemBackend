const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
LoginID: { type: String, unique: true },
  CompanyName: String,
  Industry: String,
  HRName: String,
  CompanyEmail: String,
  ContactNo: String,
  WebsiteLink: String,
  AboutCompany: String,
  Password: String,
  ConfirmPassword: String,
});



const ComRegistrationModel = mongoose.model('Company', RegistrationSchema);
module.exports = ComRegistrationModel;

