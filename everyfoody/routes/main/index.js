var express = require('express');
var router = express.Router();
var main = require('./mainlist');
var sidemenu = require('./sidemenu');
var toggle = require('./toggle');

router.use('/lists', main);
router.use('/sidemenu', sidemenu);
router.use('/toggle', toggle);

module.exports = router;
