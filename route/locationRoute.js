const express = require('express');
const { addLocation } = require('../controller/LocationController');


const router = express.Router();

router.route('/').post(addLocation)