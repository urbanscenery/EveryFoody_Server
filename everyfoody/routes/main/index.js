const express = require('express');
const router = express.Router();
const main = require('./mainlist');
const sidemenu = require('./sidemenu');
const toggle = require('./toggle');
const notice = require('./notice');

router.use('/notice', notice);
router.use('/lists', main);
router.use('/sidemenu', sidemenu);
router.use('/toggle', toggle);
router.use('/notice', notice);

module.exports = router;
