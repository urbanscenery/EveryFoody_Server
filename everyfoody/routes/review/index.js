var express = require('express');
var router = express.Router();
var registration = require('./registration');
var lists = require('./lists');


router.use('/registration', registration);
router.use('/lists', lists);


module.exports = router;
