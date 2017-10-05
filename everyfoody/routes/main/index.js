var express = require('express');
var router = express.Router();
var main = require('./mainlist');
var sidemenu = require('./sidemenu');


router.use('/lists', main);
router.use('/sidemenu', sidemenu);


module.exports = router;
