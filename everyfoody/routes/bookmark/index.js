var express = require('express');
var router = express.Router();
var bookmark = require('./bookmark');


router.use('/bookmark', bookmark);


module.exports = router;
