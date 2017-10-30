const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const upload = require('../../modules/AWS-S3');
const express = require('express');
const router = express.Router();

router.put('/', upload.single('image'), (req, res) => {

  let user_imageURL = req.file.location;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
        else callback(null, connection);
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    (userID, connection, callback) => {
      let menumodifyQuery = 'update users set user_imageURL = ? where user_id = ?';
      connection.query(menumodifyQuery, [user_imageURL, userID], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "myprofile update error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "myprofile modify success"
          });
          connection.release();
          callback(null, "modify success");
        }
      });
    }
  ]
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