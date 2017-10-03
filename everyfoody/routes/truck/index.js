var express = require('express');
var router = express.Router();
var infomation = require('./infomaion');
var location = require('./location');
var registration = require('./registration');
var reservation = require('./reservation');
var myinfo = require('./myinfo');
var opening = require('./opening');


router.use('/infomation', infomation);
router.use('/location',location);
router.use('/regisration', registration);
router.use('/reservation', reservation);
router.use('/myinfo', myinfo);
router.use('/opening', opening);


module.exports = router;
