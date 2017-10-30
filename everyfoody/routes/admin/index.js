const express = require('express');
const router = express.Router();
const confirm = require('./confirm');
const reject = require('./reject');


router.use('/confirm', confirm);
router.use('/reject', reject);


module.exports = router;
