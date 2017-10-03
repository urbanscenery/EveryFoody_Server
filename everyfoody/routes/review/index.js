var express = require('express');
var router = express.Router();
var review = require('./review');


router.use('/review', review);


module.exports = router;
