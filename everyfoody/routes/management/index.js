var express = require('express');
var router = express.Router();
var menuinfo = require('./menuinfo');
var customers = require('./customers');
var registration = require('./registration');
var profile = require('./profile');
var ownerinfo = require('./ownerinfo');

router.use('/menuinfo', menuinfo);
router.use('/ownerinfo', ownerinfo);
router.use('/customers', customers);
router.use('/registration', registration);
router.use('/myprofile', profile);


module.exports = router;
