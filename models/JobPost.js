const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
    JobTitle: String,
    Company: String,
    JobType: String,
    Location: String,
    Salary: String,
    SkillsRequirement: String,
    JobResponsibilities: String,
    JobDescription: String,
    
});

const JobPostModel  = mongoose.model("JobPost", JobPostSchema);
module.exports = JobPostModel;