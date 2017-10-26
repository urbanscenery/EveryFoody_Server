var express = require('express');
var router = express.Router();
var myinfo = require('./myinfo');
var customers = require('./customers');
var registration = require('./registration');
var profile = require('./profile');

router.use('/myinfo', myinfo);
router.use('/customers', customers);
router.use('/registration', registration);
router.use('/myprofile', profile);


module.exports = router;
