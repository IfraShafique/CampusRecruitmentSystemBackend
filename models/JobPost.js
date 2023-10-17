const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
    date:{
        type: Date,
        default: Date.now(),
      },
    JobTitle: String,
    CompanyName: String,
    JobType: String,
    Location: String,
    Salary: String,
    SkillsRequirement: String,
    JobResponsibilities: String,
    JobDescription: String,
    applicants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'StudentProfile', 
    }]
    
});

const JobPostModel  = mongoose.model("JobPost", JobPostSchema);
module.exports = JobPostModel;