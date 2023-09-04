const express = require('express');
const mongoose = require('mongoose'); // Correct
const cors = require("cors");
const multer = require('multer'); // Require multer
const ComRegistrationModel = require('./models/CompanyRegistration');
const StuRegistrationModel = require('./models/StudentRegistration');
const StudentProfileModel = require('./models/StudentProfile')

const app = express();
app.use(express.json())
app.use(cors())
const port = 4000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './ResumeUpload'); // Define the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      // Define how the uploaded file should be named
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  });
    const upload = multer({ storage }); // Create an upload middleware

    require('dotenv').config();
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

// *************** Company Registration Form **********************
// route company
app.post("/company", (req, res) => {
    console.log('Received data:', req.body);
    ComRegistrationModel.create(req.body)
    .then(company => {
        console.log("Saved data:", company);
        res.json(company);
    })
    .catch(err => {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    });
});


// ****************** Student Registration Form *************************
app.post("/studentreg", (req, res) => {
    console.log('Received data:', req.body);
    StuRegistrationModel.create(req.body)
    .then(student => {
        console.log("Student Saved Data:", student);
        res.json(student);
    })
    .catch(err => {
        console.log("Error in Student Registration:", err);
        res.status(500).json({error: "Internal Server Error"})
    })
});


// ***************** Student Profile **********************

app.post("/stuprofile", upload.single('resume'), (req, res) => {
    const resumeFile = req.file; // Access the uploaded file via req.file

    if (!resumeFile) {
        // Handle the case where no file was uploaded
        return res.status(400).json({ error: "No resume file uploaded" });
    }

    // Access other form fields from req.body
    const studentProfileData = {
        Name: req.body.Name,
        ContactNo: req.body.ContactNo,
        Address: req.body.Address,
        Email: req.body.Email,
        Department: req.body.Department,
        CurrentSemester: req.body.CurrentSemester,
        CGPA: req.body.CGPA,
        Skills: req.body.Skills,
        resumePath: resumeFile.path, // Corrected: Use the file itself, not its buffer
    };

    console.log('Received Student Profile Data: ', studentProfileData);
    
    // Now you can use studentProfileData to save it to the database
    StudentProfileModel.create(studentProfileData)
        .then(studentProfile => {
            console.log("Student Profile Data Saved: ", studentProfile);
            res.json(studentProfile);
        })
        .catch(err => {
            console.log("Error in student profile registration", err);
            res.status(500).json({
                error: "Internal server Error"
            });
        });
});


app.get("/get-image", async(req, res) => {
    try{
        StudentProfileModel.find({}).then((data) => {
            res.send({status: "ok", data: data});
        });
    }catch (error) {
        res.json({staus: "Internal Server Error"})
    }
})


// app.post("/stuprofile", upload.single('resume'), (req, res) => {
//     const resumeFile = req.file; // Access the uploaded file via req.file

//     if (!resumeFile) {
//         // Handle the case where no file was uploaded
//         return res.status(400).json({ error: "No resume file uploaded" });
//     }

//     const studentProfileData = {
//         // other fields
//         resume: resumeFile.buffer, // Convert the file to a Buffer
//     };

//     console.log('Received Student Profile Data: ', req.body);
//     StudentProfileModel.create(studentProfileData)
//         .then(studentProfile => {
//             console.log("Student Profile Data Saved: ", studentProfile);
//             res.json(studentProfile);
//         })
//         .catch(err => {
//             console.log("Error in student profile registration", err);
//             res.status(500).json({
//             error: "Internal server Error"
//             });
//         });

// });

app.listen(port, () => { console.log(`Server started on port ${port} http://localhost:4000`); });
