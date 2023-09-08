const express = require('express');
const router = express.Router();
const companyController = require('../Controllers/companyController');

router.post('/company', companyController.createCompany);

module.exports = router;