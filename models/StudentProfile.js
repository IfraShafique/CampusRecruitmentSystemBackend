const mongoose = require('mongoose');

 
const StudentProfileSchema = new mongoose.Schema({
  Name: {
    type: String,
    require: "Name is required"

  },
  ContactNo: {type: String, require: "Contact No is Required"},
  Address:{type: String, require:"Address is required"},
  Department: {type: String, require: "Department is require"},
  CurrentSemester: {type:String, require: "Enter your current semester"},
  CGPA: {type: String, require: "Enter your CGPA"},
  Skills: {type: String, require: "Skills required"},
  resumePath: {type: String, require: true},
  jobApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    
  },
}); 

const StudentProfileModel = mongoose.model("StudentProfile", StudentProfileSchema);
module.exports = StudentProfileModel;
