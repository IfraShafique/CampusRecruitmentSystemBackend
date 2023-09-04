const mongoose = require('mongoose');


const StudentRegSchema = new mongoose.Schema({
    StudentID: String,
    StudentName: String,
    Email: String,
    Password: String,
    ConfirmPassword: String,
});



const StuRegistrationModel = mongoose.model('Student', StudentRegSchema);
module.exports = StuRegistrationModel;

