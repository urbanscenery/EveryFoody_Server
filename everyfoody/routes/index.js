var express = require('express');
var router = express.Router();
var information = require('./truck/index');
var bookmark = require('./bookmark/index');
var region = require('./main/index');
var review = require('./review/index');
var signin = require('./login/signin');
var signup = require('./login/signup');
var reservation = require('./reservation/index');
var api = require('./apireference');

router.use('/truck/information',information);
router.use('/main', region);
router.use('/bookmark', bookmark);
router.use('/review', review);
router.use('/signin', signin);
router.use('/signup', signup)
router.use('/api', api);

module.exports = router;
