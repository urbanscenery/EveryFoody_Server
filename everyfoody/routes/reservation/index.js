var express = require('express');
var router = express.Router();
var compilation = require('./compilation');
var lists = require('./list');


router.use('/compilation', compilation);
router.use('/lists', lists);


module.exports = router;
