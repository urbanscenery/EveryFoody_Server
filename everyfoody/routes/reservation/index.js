var express = require('express');
var router = express.Router();
var reservation = require('./reservation');


router.use('/reservation', reservation);


module.exports = router;
