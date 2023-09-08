const ComRegistrationModel = require('../models/CompanyRegistration');

exports.createCompany = (req, res) => {
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
};