const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

/* GET users listing. */
router.get('/:location/:count', function(req, res) {

  var location = req.params.location;
  res.status(200).send({
      status: "success",
      data: [
      	{
      		address : "서울시 마포구",
      		storeList : [
      			{
      				storeID : 5,
      				storeName : "dongsu's store",
      				storeImageURL : "",
      				reservationCount : 5,
      				distance : 280
      			},
      			{
      				storeID : 7,
      				storeName : "yeontae's store",
      				storeImageURL : "",
      				reservationCount : 3,
      				distance : 290
      			}
      		]
      	},
      	{
      		address : "서울시 은평구",
      		storeList : [
      			{
      				storeID : 8,
      				storeName : "dongsu's store2",
      				storeImageURL : "",
      				reservationCount : 1,
      				distance : 150
      			},
      			{
      				storeID : 10,
      				storeName : "yeontae's store2",
      				storeImageURL : "",
      				reservationCount : 2,
      				distance : 300
      			}
      		]
      	}
      ],
      msg : "OK"
  });
});

module.exports = router;