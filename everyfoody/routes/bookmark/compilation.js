const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.put('/:storeID', function(req, res) {
  res.status(200).send({
    status: "success",
    msg : "successful add / delete bookmark list"
  });
});

module.exports = router;