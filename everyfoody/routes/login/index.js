var express = require('express');
var router = express.Router();
var main = require('./login');
var registration = require('./registration');


router.use('/login', main);
router.use('/registration', registration);

module.exports = router;
