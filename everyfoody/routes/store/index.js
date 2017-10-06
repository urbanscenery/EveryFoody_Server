var express = require('express');
var router = express.Router();
var information = require('./information');
var location = require('./location');


router.use('/info', information);
router.use('/location',location);


module.exports = router;
