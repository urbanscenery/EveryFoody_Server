var express = require('express');
var router = express.Router();
var myinfo = require('./myinfo');


router.use('/myinfo', myinfo);


module.exports = router;
