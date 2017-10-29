const express = require('express');
const router = express.Router();
const store = require('./store/index');
const bookmark = require('./bookmark/index');
const region = require('./main/index');
const review = require('./review/index');
const signin = require('./login/signin');
const signup = require('./login/signup');
const reservation = require('./reservation/index');
const management = require('./management/index');
const api = require('./apireference');

const registdata = require('./main/registdata');

router.use('/store',store);
router.use('/main', region);
router.use('/bookmark', bookmark);
router.use('/reservation', reservation);
router.use('/review', review);
router.use('/signin', signin);
router.use('/signup', signup);
router.use('/management', management);
router.use('/api', api);
router.use('/registdata', registdata);


module.exports = router;
