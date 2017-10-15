var express = require('express');
var router = express.Router();
var store = require('./store/index');
var bookmark = require('./bookmark/index');
var region = require('./main/index');
var review = require('./review/index');
var signin = require('./login/signin');
var signup = require('./login/signup');
var reservation = require('./reservation/index');
var management = require('./management/index');
var api = require('./apireference');

var registdata = require('./main/registdata');

router.use('/store',store);
router.use('/main', region);
router.use('/bookmark', bookmark);
router.use('/reservation', reservation);
router.use('/review', review);
router.use('/signin', signin);
router.use('/signup', signup)
router.use('/management', management);
router.use('/api', api);
router.use('/registdata', registdata);


module.exports = router;
