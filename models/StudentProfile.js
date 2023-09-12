const mongoose = require('mongoose');


const StudentProfileSchema = new mongoose.Schema({
  Name: String,
  ContactNo: String,
  Address: String,
  Department: String,
  CurrentSemester: String,
  CGPA: String,
  Skills: String,
  resumePath: String,
  studentRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
}); 

const StudentProfileModel = mongoose.model("StudentProfile", StudentProfileSchema);
module.exports = StudentProfileModel;
