const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose'); // Correct
const cors = require("cors");
const multer = require('multer'); // Require multer
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');
const ComRegistrationModel = require('./models/CompanyRegistration');
const UserRegistrationModel = require('./models/Registration');
const StudentProfileModel = require('./models/StudentProfile');
const JobPostModel = require('./models/JobPost');
const bcryptjs = require('bcryptjs');
const authenticate  = require('./Middleware/authentication');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(cors({
  origin: ["http://localhost:3000"],
  method: ["GET","POST"],
  credentials:true,
}))
const port = 4000;

// These method is used to get data from frontend
app.use(express.json())
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());
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

//  **********Check The Role*************
const checkUserRole = (role) => {
  return (req, res, next) => {
    // Assuming the user's role is stored in req.userRole
    if (req.userRole === role) {
      next(); // User has the required role, continue to the route handler
    } else {
      res.status(403).json({ message: 'Access denied' }); // User doesn't have the required role
    }
  };
};

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

    // Company panel by id
    app.get("/company-panel/:id", async (req, res) => {
      const id = req.params.id;
      console.log("User ID from route parameters:", id);
      
      try {
        const userData = await UserRegistrationModel.findById(id);
        console.log(userData);
        
        if (!userData) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.json(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    

    // Get Data from Company API
  app.get("/get-companies", async(req, res) => {
    try{
      const companies = await UserRegistrationModel.find({Role: "company"});
  
      res.json({status: "success", data: companies});
    }

    catch (error) {
      console.log("Error in company Fetching Data: ", error);
      res.status(500).json({error: "Internal error for fetching company data"})
    };
  })

  // Fetch data by ID
  app.get('/get-companies/:companyId', async (req, res) => {
    try {
      const companyId = req.params.companyId;
      const company = await UserRegistrationModel.findById(companyId);
      
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
  
      res.json({ status: 'success', data: company });
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } 
  });
  
  // Delete company Data
  app.delete("/delete-company/:companyId", async(req, res) => {
    try{
      const companyId = req.params.companyId;
  
      const deleteCompany = await ComRegistrationModel.findByIdAndDelete(companyId);
      if (!deleteCompany) {
        return res.status(404).json({error: "Job not found"})
      }
  
      res.json({message: "Job deleted successfully"})
    } catch(err) {
      res.status(500).json({err:"Internal server error for job delete"})
    }
  });


// ****************** Student Registration Form *************************
app.post("/registration", async (req, res) => {
    try {
      const registration = {
        LoginID: req.body.LoginID,
        Name: req.body.Name,
        Email: req.body.Email,
        ContactNo: req.body.ContactNo,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Role: req.body.Role,
        tokens: req.body.tokens,
        studentProfile: req.body.studentProfile,
        jobPost: req.body.jobPost,
      };
      console.log('Received data:', req.body);
  
      const user = await UserRegistrationModel.create(registration);
      console.log("Registration Saved:", user);
      const userData = await user.save();
      res.json(userData);


      
    } catch (err) {
      console.log("Error in Registration:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post('/registration-get' , async(req, res) => {
    const getUserProfile = await UserRegistrationModel.find({_id:req.body._id}).populate('studentProfile')
      res.json(getUserProfile)
  })
  
// Fetch Student Data
app.get("/get-students", async(req, res) => {
  try{
    const students = await UserRegistrationModel.find({Role: "student"});

    res.json({status: "success", data: students});
  }

  catch(error) {
    res.status(500).json({error: "Internal error in student fetching data"})
  }
});



// ***************** Student Profile **********************

app.post("/stuprofile",authenticate, upload.single('resume'), async (req, res) => {
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
      await studentProfile.save();

      // Make a relationship
      // const userId = req.body.userId;
      // console.log(userId)
      const userId = req.user._id; 
      const user = await UserRegistrationModel.findById(userId);
      console.log(user._id)
      if (user) {
        user.studentProfile = studentProfile._id; // Set the studentProfile field in the user document
        await user.save();
      }

      // Make a relation to a job post
      const applicant = await JobPostModel.findById(userId);
      console.log(userId)
      if(applicant) {
        applicant.stuProfile = studentProfile._id;
        await applicant.save();
      }
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
      res.status(A500).json({error: "Internal error in student profile fetching data"})
    }
  })
  
  // Fetch company data by ID
  app.get("/get-studentsDetail", async(req, res) => {

  try{
    const studentId = req.user._id;
    const stuProfiles = await UserRegistrationModel.findById(studentId);

    const student = new student();
    student.stuProfiles = studentId;
    await student.save();

    stuProfiles.student.push(student._id);
    await stuProfiles.save();

    if(!stuProfiles) {
      res.status(400).json({error: "Internal server error for specific student data fetching"})
    }
    res.json({status: "success", data: stuProfiles});
  }

  catch(error) {
    res.status(500).json({error: "Internal error in student fetching data"})
  }
});

// ******************Job Post Form*****************************

app.post('/post-job',authenticate, async (req, res) => {
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

      const userId = req.user._id; 
      const user = await UserRegistrationModel.findById(userId);
      console.log(user._id)
      if (user) {
        user.jobPost = jobPost._id; // Set the post field in the user document
        await user.save();
      }
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


// *************Login Form****************//
app.post('/login', async (req, res) => {
  try {
    const LoginID = req.body.LoginID;
    const Password = req.body.Password;
    // console.log(req.body);

    let user = ''; // Initialize user as null

    user = await UserRegistrationModel.findOne({ LoginID: LoginID });

    if (user) {
      // console.log('User found:', user);
      const isMatch = await bcryptjs.compare(Password, user.Password);
      console.log('isMatch:', isMatch);

      if (isMatch) {
        const token = await user.generateToken();
      
        // console.log('Generated token:', token);
        // console.log('User Object:', user); // Log the user object here to see if _id is present
      
        res.cookie("jwt", token, {
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + 18000000),
        });
      
        res.json({ Role: user.Role, token: token, Id: user._id });
      }
      }} catch (error) {
    console.error(error);
    res.status(400).send("Invalid Credentials");
  }}
);

// *********Logout***********
app.get('/logout', (req, res) => {
  // Clear the JWT cookie by setting its expiration to the past
  res.clearCookie('jwt', { path: '/' });
  

  res.status(200).send('User successfully logged out');
});



// ********************Admin panel**********************
app.get('/userData', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }
    const userId = req.user._id; // Use req.user._id to get the user's ID

    const user = await UserRegistrationModel.findById(userId).select("-Password -ConfirmPassword");
    // res.send(user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user)
    // Assuming 'user' contains the user data you want to send back
    res.status(200).json(user);
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ********************Student profile**********************
app.get('/student-profile/:studentId', authenticate, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }
    const userId = req.user._id; // Use req.user._id to get the user's ID

    const user = await UserRegistrationModel.findById(studentId).populate({
      path: 'studentProfile',
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user)
    const studentProfile = user.studentProfile;

    // Send the student profile data as JSON response
    res.status(200).json(studentProfile);
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ********************Specific company job posts**********************


app.get('/jobPost/:companyId', authenticate, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const user = await UserRegistrationModel.findById(companyId).populate('jobPost'); // Assuming you have a 'jobPosts' field in your user schema

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const jobPost = user.jobPost; // Assuming 'jobPosts' is the field where you store job posts related to the user

    // Send the job posts as a JSON response
    res.status(200).json(jobPost);
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





// Change Password
app.post('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    console.log('Received request body:', req.body);

    // Find the user by their ID
    const user = await UserRegistrationModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password and update the new password
    const passwordMatch = await bcryptjs.compare(oldPassword, user.Password);

    console.log('isMatch:', passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (typeof newPassword !== 'string' || newPassword.length === 0) {
      return res.status(400).json({ message: 'New password is invalid' });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password with the hashed password
    user.Password = hashedPassword;
    await user.save();

    console.log('Password updated successfully');
    res.json({ message: 'Password is successfully updated' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// **********Apply for job**************
app.post('/student-panel',authenticate, async(res, req) => {
  try {
    
    const postId = req.user._id;
    const { studentProfileId } = req.body;
  
    const post = await JobPostModel.findById(postId);
    if(!post){
      return res.status(404).json({error: "No post Found"})
    }
  
    post.applicants.push(studentProfileId);
    await post.save();
    res.status(201).json({ message: "Application submitted successfully" });

  } catch (error) {
    console.error("Error submitting job application:", error);
      return res.status(500).json({error: "Internal server error"})
  }
})



app.listen(port, () => { console.log(`Server started on port ${port} http://localhost:4000`); });