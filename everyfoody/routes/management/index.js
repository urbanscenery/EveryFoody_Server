var express = require('express');
var router = express.Router();
var myinfo = require('./myinfo');
var customers = require('./customers');
var registration = require('./registration');

router.use('/myinfo', myinfo);
router.use('/customers', customers);
router.use('/registration', registration);

module.exports = router;
