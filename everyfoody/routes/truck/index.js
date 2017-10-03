var express = require('express');
var router = express.Router();
var information = require('./information');
//var location = require('./location');
var reservation = require('./reservation');
//var opening = require('./opening');


router.use('/info', information);
//router.use('/location',location);
router.use('/reservation', reservation);
//router.use('/opening', opening);


module.exports = router;
