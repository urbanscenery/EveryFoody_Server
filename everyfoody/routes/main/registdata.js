const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../modules/AWS-S3');


router.post('/', upload.single('image'), (req, res) => {
  let taskArray = [
    //1. connection 설정
    (callback) => {
      pool.getConnection((err, connection) => {
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
    (connection, callback) => {
      let insertReviewQuery = 'insert into menu set ?';
      let imageURL;
      if (typeof req.file === "undefined") {
        imageURL = null;
      } else {
        imageURL = req.file.location;
      }
      let reviewData = {
        owner_id: Number(req.body.storeID),
        menu_name: req.body.name,
        menu_price: Number(req.body.price),
        menu_imageURL: imageURL
      };
      connection.query(insertReviewQuery, reviewData, (err) => {
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
  async.waterfall(taskArray, (err, result) => {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  });
});

module.exports = router;