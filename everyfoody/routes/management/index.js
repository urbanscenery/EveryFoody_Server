const express = require('express');
const router = express.Router();
const menuinfo = require('./menuinfo');
const customers = require('./customers');
const registration = require('./registration');
const profile = require('./profile');
const ownerinfo = require('./ownerinfo');
const check = require('./check');

router.use('/menuinfo', menuinfo);
router.use('/ownerinfo', ownerinfo);
router.use('/customers', customers);
router.use('/registration', registration);
router.use('/myprofile', profile);
router.use('/check', check);

module.exports = router;
