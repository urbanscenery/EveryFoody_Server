const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../modules/AWS-S3');


router.post('/', upload.single('image'), function(req, res) {
  let taskArray = [
    //1. connection 설정
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get connection error"
          });
          callback("getConnection error : " + err, null);
        } else callback(null, connection);
      });
    },
    //사진 등록
    function(connection, callback) {
      let insertReviewQuery = 'insert into menu set ?';
      let imageURL;
      if (typeof req.file === "undefined") {
        imageURL = null;
      } else {
        imageURL = req.file.location;
      }
      console.log(req.body.storeID);
      console.log(req.body.price);
      let reviewData = {
        owner_id: (req.body.storeID) * 1,
        menu_name: req.body.name,
        menu_price: (req.body.price) * 1,
        menu_imageURL: imageURL
      };
      console.log(reviewData);
      connection.query(insertReviewQuery, reviewData, function(err) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "regist review error"
          });
          connection.release();
          callback("regist review error : " + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "successful regist menu"
          });
          connection.release();
          callback(null, "successful regist menu");
        }
      });
    }
  ];
  async.waterfall(taskArray, function(err, result) {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  });
})

module.exports = router;