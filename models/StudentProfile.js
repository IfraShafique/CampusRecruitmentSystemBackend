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

}); 

const StudentProfileModel = mongoose.model("StudentProfile", StudentProfileSchema);
module.exports = StudentProfileModel;
