const express = require('express');
const router = express.Router();
const information = require('./information');
const location = require('./location');


router.use('/info', information);
router.use('/location',location);


module.exports = router;
