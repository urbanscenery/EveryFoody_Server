var express = require('express');
var router = express.Router();
var reservation = require('./reservation');
var lists = require('./list');


router.use('/reservation', reservation);
router.use('/lists', lists);


module.exports = router;
