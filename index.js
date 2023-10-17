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
const jwt = require('jsonwebtoken')

require('dotenv').config();

const app = express();
app.use(cors({
  origin: ["https://campus-recruitment-system-cy8xkr0j3-ifrashafique.vercel.app"],
  method: ["GET","POST","DELETE"],
  credentials:true,
}))

// const corsOptions ={
//   origin:'https://campus-recruitment-system-delta.vercel.app', 
//   credentials:true,            //access-control-allow-credentials:true
//   method: ["GET","POST","DELETE"],
// }
// app.use(cors(corsOptions));

// app.use(cors())
const port = 4000;
// app.use(authenticate);
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
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET_KEY 
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
app.post('/company', async(req, res) => {
    try{
        console.log('Received data:', req.body);
        const company = await ComRegistrationModel.create(req.body)
        console.log("Saved data:", company);
        res.json(company);
        }
    catch (err ) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
        };
    })

    // Company panel by id
    app.get('/company-panel/:id', async (req, res) => {
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
        res.status(500).json({  error: error.message });
      }
    });
    

    // Get Data from Company API
  app.get('/get-companies', async(req, res) => {
    try{
      const companies = await UserRegistrationModel.find({Role: "company"});

      const totalCompanies = companies.length;
  
      res.json({status: "success", data: companies, companies: totalCompanies});
      console.log(totalCompanies)
    }

    catch (error) {
      console.log("Error in company Fetching Data: ", error);
      res.status(500).json({ error: error.message})
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
      res.status(500).json({  error: error.message});
    } 
  });
  
  // Delete company Data
  app.delete('/delete-company/:companyId',authenticate, async(req, res) => {
    try{
      const companyId = req.params.companyId;
      console.log('Deleting company with ID:', companyId);
  
      const deleteCompany = await UserRegistrationModel.findByIdAndDelete(companyId);
      if (!deleteCompany) {
        return res.status(404).json({error: "Job not found"})
      }
  
      res.json({message: "Job deleted successfully"})
    } catch(err) {
      res.status(500).json({ error: err.message})
    }
  });
  
  // Delete company Data
  app.delete('/delete-student/:studentId',authenticate, async(req, res) => {
    try{
      const studentId = req.params.studentId;
      console.log('Deleting company with ID:', studentId);
  
      const deleteCompany = await UserRegistrationModel.findByIdAndDelete(studentId);
      if (!deleteCompany) {
        return res.status(404).json({error: "Job not found"})
      }
  
      res.json({message: "Job deleted successfully"})
    } catch(err) {
      res.status(500).json({ error: err.message})
    }
  });


// ****************** Student Registration Form *************************
app.post('/registration', async (req, res) => {
    try {
      const registration = {
        LoginID: req.body.LoginID,
        Name: req.body.Name,
        Email: req.body.Email,
        ContactNo: req.body.ContactNo,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Role: req.body.Role,
        // tokens: req.body.tokens,
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
      res.status(500).json({  error: err});
    }
  });

  // app.post('/registration-get', async(req, res) => {
  //   const getUserProfile = await UserRegistrationModel.find({_id:req.body._id}).populate('studentProfile')
  //     res.json(getUserProfile)
  // })
  
// Fetch Student Data
app.get('/get-students', async(req, res) => {
  try{
    const students = await UserRegistrationModel.find({Role: "student"});

    const totalStudetn = students.length;

    res.json({status: "success", data: students, students: totalStudetn});
  }

  catch(error) {
    res.status(500).json({ error: error.message})
  }
});



// ***************** Student Profile **********************

app.post('/stuprofile',authenticate, upload.single('resume'), async (req, res) => {
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
        error: err
      });
    }
  });

  app.get('/get-studentProfileData', async (req, res) => {

    try{
      const stuProfiles = await StudentProfileModel.find();
      res.json({status: "success", data: stuProfiles });
    }
  
    catch(error) {
      res.status(A500).json({ error: error.message})
    }
  })
  
  // Fetch student data by ID
  app.get('/get-studentsDetail', async(req, res) => {

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
    res.status(500).json({ error: error.message})
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
      const users = await StudentProfileModel.findById(userId);
      console.log(user._id)
      if (users) {
        users.jobApplied = jobApplied._id; // Set the post field in the user document
        await users.save();
      }
      res.json(jobPost);
    } catch (err) {
      console.error('Error in Job Posting:', err);
      res.status(500).json({  error: err.message });
    }
  });
  

  app.get('/get-Jobs', async (req, res) => {

  try{
    const posts = await JobPostModel.find();

    const totalPosts = posts.length;
    res.json({status: "success", data: posts, posts: totalPosts});
  }

  catch(error) {
    res.status(500).json({error: "Internal error in job post fetching data"})
  }
})

// Delete the job vacancy
app.delete('/delete-job/:jobId', async(req, res) => {
  try{
    const jobId = req.params.jobId;

    const deleteJob = await JobPostModel.findByIdAndDelete(jobId);
    if (!deleteJob) {
      return res.status(404).json({error: "Job not found"})
    }

    res.json({message: "Job deleted successfully"})
  } catch(err) {
    res.status(500).json({ error: err.message})
  }
});

// Delete the job vacancy
app.put('/edit-job/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { JobTitle, CompanyName, JobType, Location, Salary, SkillsRequirement, JobResponsibilities, JobDescription } = req.body;

    const edit = {};
    if (JobTitle) { edit.JobTitle = JobTitle };
    if (CompanyName) { edit.CompanyName = CompanyName };
    if (JobType) { edit.JobType = JobType };
    if (Location) { edit.Location = Location };
    if (Salary) { edit.Salary = Salary };
    if (SkillsRequirement) { edit.SkillsRequirement = SkillsRequirement };
    if (JobResponsibilities) { edit.JobResponsibilities = JobResponsibilities };
    if (JobDescription) { edit.JobDescription = JobDescription };

    const editJob = await JobPostModel.findByIdAndUpdate(jobId,
      { $set: edit }, { new: true });

    if (!editJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    console.log(editJob);
    res.json(editJob);
  } catch (err) {
    console.error("Error editing job:", err);
    res.status(500).json({  error: err.message });
  }
});


// *************Login Form****************//
app.post('/login', async (req, res) => {
  try { 
    console.log('check login');
    const LoginID = req.body.LoginID;
    const Password = req.body.Password;
    // console.log(req.body);

    // let user = ''; // Initialize user as null

    const user = await UserRegistrationModel.findOne({ LoginID: LoginID });
    // console.log('user', user)
    if (!user) res.status(404).send({message: 'user not found'})
    if (user) {
      if (Password === user.Password) {
        const token = await user.generateToken();
      

        // res.header("jwt", token, {
        //   httpOnly: true,
        //   secure: true,
          
        // });`
      
        // res.cookie("jwt", token, {
        //   httpOnly: true,
        //   secure: true,
        //   // expires: new Date(Date.now() + 18000000),
        // });
      

        res.header("jwt", token, {
          httpOnly: true,
          secure: true,
          
        });
        res.json({ Role: user.Role, token: token, Id: user._id });
      }
    } 

    // if (user) {
    //   console.log('User found:', user);
    //   const isMatch = await bcryptjs.compare(Password, user.Password);
    //   console.log('isMatch:', isMatch);
      

    //   if (isMatch) {
    //     const token = await user.generateToken();
      
    //     // console.log('Generated token:', token);
    //     // console.log('User Object:', user); // Log the user object here to see if _id is present
      
    //     res.cookie("jwt", token, {
    //       httpOnly: true,
    //       secure: true, 
    //       expires: new Date(Date.now() + 18000000),
    //     });
      
    //     res.json({ Role: user.Role, token: token, Id: user._id });
    //   }
    //   }
    } catch (error) {
    console.error(error);
    res.status(400).send(error);
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
    // if (!req.user) {
    //   return res.status(401).json({ message: 'Unauthorized user' });
    // }
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
    res.status(500).json({  error: error.message });
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
    res.status(500).json({  error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});


// get the specific company job posts
app.get('/totalPosts', authenticate, async (req, res) => {
  try {
    const totalPosts = await UserRegistrationModel.findById(req.user._id).populate('jobPost');
    const jobPosts = totalPosts.jobPost;
    const totalJobPosts = jobPosts.length;
    res.json({ user: totalJobPosts });
  } catch (error) {
    res.status(500).json({  error: error });
  }
});

// get the total number of applicants of a specific company
app.get('/totalApplicant', authenticate, async(req, res) => {
  try {
    const totalPosts = await UserRegistrationModel.findById(req.user._id).populate({
      path: 'jobPost',
      populate: {
        path: 'applicants',
        model: 'StudentProfile',
      },
    });
    const jobPosts = totalPosts.jobPost;
    let totalJobApplicants = 0;
    jobPosts.forEach((jobPost) => {
      totalJobApplicants += jobPost.applicants.length;
    });
    console.log(totalJobApplicants)
    res.json({ user: totalJobApplicants });
  } catch (error) {
    res.status(500).json({ error: error.message})
  }
})


// Company Change Password
app.post('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // Find the user by their ID
    const user = await UserRegistrationModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password directly (plaintext comparison)
    if (oldPassword !== user.Password) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (typeof newPassword !== 'string' || newPassword.length === 0) {
      return res.status(400).json({ message: 'New password is invalid' });
    }

    // Update the user's password directly
    user.Password = newPassword;

    // Save the updated user object
    await user.save();

    console.log('Password updated successfully');
    res.json({ message: 'Password is successfully updated' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Student Change Password
app.post('/stuchangepass', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // Find the user by their ID
    const user = await UserRegistrationModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (oldPassword !== user.Password) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (typeof newPassword !== 'string' || newPassword.length === 0) {
      return res.status(400).json({ message: 'New password is invalid' });
    }

    user.Password = newPassword;
    // Save the updated user object
    await user.save();
    console.log("Received request body:", req.body);

    console.log(oldPassword, newPassword)
    console.log('Password updated successfully');
    res.json({ message: 'Password is successfully updated' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message});
  }
});

// Admin Change Password
app.post('/changepass', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // Find the user by their ID
    const user = await UserRegistrationModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (oldPassword !== user.Password) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (typeof newPassword !== 'string' || newPassword.length === 0) {
      return res.status(400).json({ message: 'New password is invalid' });
    }

    user.Password = newPassword;
    // Save the updated user object
    await user.save();
    console.log("Received request body:", req.body);

    console.log('Password updated successfully');
    res.json({ message: 'Password is successfully updated' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({  error: error.message });
  }
});



// **********Apply for job**************
app.post('/student-panel', authenticate, async (req, res) => {
  try {
    const { studentProfileId, postId } = req.body;

    // Retrieve the job post by postId
    const post = await JobPostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }

    // Push the studentProfileId into the applicants array
    post.applicants.push(studentProfileId);
    
    // Save the job post with the updated applicants list
    await post.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting job application:", error);
    return res.status(500).json({  error: error.message});
  }
});



// Get Applicant
app.get('/get-applicants', authenticate, async (req, res) => {
  try {
    const userId = req.user._id; // Get the authenticated user's ID

    // Find the user by ID and populate their job posts with applicants
    const user = await UserRegistrationModel.findById(userId).populate({
      path: 'jobPost',
      populate: {
        path: 'applicants',
        model: 'StudentProfile',
      },
    });

    console.log(user)
    // Extract the applicants from the populated user's job posts
    const applicants = user.jobPost.flatMap((jobPost) => jobPost.applicants);

    // Check if there are any applicants
    if (applicants.length === 0) {
      return res.json({ message: 'No applicants found' });
    }
    res.json(applicants);
    console.log(applicants)
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({  error: error.message });
  }
});


// Refresh Token
app.post('/refreshToken', async(req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the user with the provided refresh token exists in the database
    const user = await UserRegistrationModel.findById(decoded._id);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a new access token
    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d', // Access token expiration time (adjust as needed)
    });

    // Send the new access token as a response
    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: error.message });
  }
});

app.listen(port, () => { console.log(`Server started on port ${port} http://localhost:4000`); });
