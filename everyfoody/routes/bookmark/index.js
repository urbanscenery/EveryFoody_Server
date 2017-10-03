var express = require('express');
var router = express.Router();
var list = require('./list');


router.use('/list', list);


module.exports = router;
