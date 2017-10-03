var express = require('express');
var router = express.Router();
var information = require('./information');
//var location = require('./location');
var reservation = require('./reservation');


router.use('/info', information);
//router.use('/location',location);
router.use('/reservation', reservation);


module.exports = router;
