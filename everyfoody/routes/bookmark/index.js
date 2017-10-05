const express = require('express');
const router = express.Router();
const list = require('./list');
const compilation = require('./compilation');


router.use('/lists', list);
router.use('/compilation', compilation);


module.exports = router;
