const express = require('express');
const router = express.Router();
const compilation = require('./compilation');
const lists = require('./list');


router.use('/compilation', compilation);
router.use('/lists', lists);


module.exports = router;
