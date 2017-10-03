const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

/* GET users listing. */
router.get('/', function(req, res) {

  var location = req.params.location;
  res.status(200).send({
    status: "success",
    data: {
      truck: [{
          truckName: "dongsu's store",
          truckImageURL: "",
          reservationCount: 5,
          reservationTime: "2017.09.25 17:00"
        },
        {
          truckName: "yeontae's store",
          truckImageURL: "",
          reservationCount: 3,
          reservationTime: "2017.09.25 17:05"
        }
      ]
    },
    msg: "OK"
  });
});

module.exports = router;