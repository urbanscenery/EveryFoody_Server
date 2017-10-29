const express = require('express');
const router = express.Router();
const registration = require('./registration');
const lists = require('./lists');


router.use('/registration', registration);
router.use('/lists', lists);


module.exports = router;
