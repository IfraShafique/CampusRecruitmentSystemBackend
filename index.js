const express = require('express');
const mongoose = require('mongoose'); // Correct
const cors = require("cors");
const multer = require('multer'); // Require multer
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');
const ComRegistrationModel = require('./models/CompanyRegistration');
const StuRegistrationModel = require('./models/StudentRegistration');
const StudentProfileModel = require('./models/StudentProfile');
const JobPostModel = require('./models/JobPost');
require('dotenv').config();

const app = express();
app.use(express.json())
app.use(cors())
const port = 4000;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './ResumeUpload'); // Define the destination folder for uploaded files
//     },
//     filename: function (req, file, cb) {
//       // Define how the uploaded file should be named
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
//     }
//   });
  

  console.log("MONGODB_URI:", process.env.MONGODB_URI);

    mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  
  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

  cloudinary.config({ 
    cloud_name: 'dppmgy4cv', 
    api_key: '938764178552318', 
    api_secret: 'XIfA1FG9eI9kWSXgxV4IQXEMBXU' 
});

// Multer and Cloudinary setup
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Resumes', // Change this to your desired folder name
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'], // Define allowed file formats
      unique_filename: true,
    },
});

const upload = multer({ 
    storage: cloudinaryStorage,
    fileFilter: (req, file, callback) => {
        if (file.fieldname === "resume") { // Make sure "resume" matches the field name in your HTML form
            callback(null, true);
        } else {
            callback(new Error("Unexpected field"));
        }
    }
});
 // Create an upload middleware

// *************** Company Registration Form **********************
// app.use('/company', companyRoutes);
// route company
app.post("/company", async(req, res) => {
    try{
        console.log('Received data:', req.body);
        const company = await ComRegistrationModel.create(req.body)
        console.log("Saved data:", company);
        res.json(company);
        }
    catch (err ) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
        };
    })

    // Get Data from Company API
  app.get("/get-companies", async(req, res) => {
    try{
      const companies = await ComRegistrationModel.find();
  
      res.json({status: "success", data: companies});
    }

    catch (error) {
      console.log("Error in company Fetching Data: ", error);
      res.status(500).json({error: "Internal error for fetching company data"})
    };
  })


// ****************** Student Registration Form *************************
app.post("/studentreg", async (req, res) => {
    try {
      console.log('Received data:', req.body);
  
      const student = await StuRegistrationModel.create(req.body);
      console.log("Student Saved Data:", student);
      res.json(student);
    } catch (err) {
      console.log("Error in Student Registration:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
app.get("/get-students", async(req, res) => {
  try{
    const students = await StuRegistrationModel.find();

    res.json({status: "success", data: students});
  }

  catch(error) {
    res.status(500).json({error: "Internal error in student fetching data"})
  }
})

// ***************** Student Profile **********************

app.post("/stuprofile", upload.single('resume'), async (req, res) => {
    try {
      const resumeUrl = req.file.path; // Access the uploaded file via req.file
  
      if (!resumeUrl) {
        // Handle the case where no file was uploaded
        return res.status(400).json({ error: "No resume file uploaded" });
      }
  
      // Access other form fields from req.body
      const studentProfileData = {
        Name: req.body.Name,
        ContactNo: req.body.ContactNo,
        Address: req.body.Address,
        Department: req.body.Department,
        CurrentSemester: req.body.CurrentSemester,
        CGPA: req.body.CGPA,
        Skills: req.body.Skills,
        resumePath: resumeUrl, // Use the file path
      };
  
      console.log('Received Student Profile Data: ', studentProfileData);
  
      // Now you can use studentProfileData to save it to the database
      const studentProfile = await StudentProfileModel.create(studentProfileData);
      console.log("Student Profile Data Saved: ", studentProfile);
      res.json(studentProfile);
    } catch (err) {
      console.log("Error in student profile registration", err);
      res.status(500).json({
        error: "Internal server Error"
      });
    }
  });

  app.get("/get-studentProfileData", async (req, res) => {

    try{
      const stuProfiles = await StudentProfileModel.find();
      res.json({status: "success", data: stuProfiles });
    }
  
    catch(error) {
      res.status(500).json({error: "Internal error in student profile fetching data"})
    }
  })
  

// ******************Job Post Form*****************************

app.post('/post-job', async (req, res) => {
    try {
      const newJobPost = {
        JobTitle: req.body.JobTitle,
        CompanyName: req.body.CompanyName,
        JobType: req.body.JobType,
        Location: req.body.Location,
        Salary: req.body.Salary,
        SkillsRequirement: req.body.SkillsRequirement,
        JobResponsibilities: req.body.JobResponsibilities,
        JobDescription: req.body.JobDescription,
      };
  
      // Save the job post to the database
      console.log('Received Student Profile Data: ', newJobPost);
  
      const jobPost = await JobPostModel.create(newJobPost);
      console.log('Job Posted Successfully', jobPost);
      res.json(jobPost);
    } catch (err) {
      console.error('Error in Job Posting:', err);
      res.status(500).json({ error: 'Internal server error in posting a job' });
    }
  });
  

  app.get("/get-Jobs", async (req, res) => {

  try{
    const posts = await JobPostModel.find();
    res.json({status: "success", data: posts});
  }

  catch(error) {
    res.status(500).json({error: "Internal error in job post fetching data"})
  }
})

// Delete the job vacancy
app.delete("/delete-job/:jobId", async(req, res) => {
  try{
    const jobId = req.params.jobId;

    const deleteJob = await JobPostModel.findByIdAndDelete(jobId);
    if (!deleteJob) {
      return res.status(404).json({error: "Job not found"})
    }

    res.json({message: "Job deleted successfully"})
  } catch(err) {
    res.status(500).json({err:"Internal server error for job delete"})
  }
});

app.listen(port, () => { console.log(`Server started on port ${port} http://localhost:4000`); });