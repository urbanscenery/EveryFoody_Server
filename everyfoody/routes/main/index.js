var express = require('express');
var router = express.Router();
var main = require('./mainlist');
var sidemenu = require('./sidemenu');
var toggle = require('./toggle');
var notice = require('./notice');

router.use('/notice', notice);
router.use('/lists', main);
router.use('/sidemenu', sidemenu);
router.use('/toggle', toggle);
router.use('/notice', notice);

module.exports = router;
