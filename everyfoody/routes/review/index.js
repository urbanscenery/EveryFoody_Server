var express = require('express');
var router = express.Router();
var registration = require('./registration');


router.use('/registration', registration);


module.exports = router;
