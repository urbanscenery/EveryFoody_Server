const async = require('async');
const mysql = require('mysql');
const moment = require('moment');
const pool = require('../../config/db_pool');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
  let taskArray = [
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
        } else {
          console.log("here!!! : " + decoded.userID);
          callback(null, decoded.userID, connection);
        }
      });
    },
    (owner_id, connection, callback) => {
      console.log("onwer_id : " + owner_id);
      let selectStatusQuery = 'select user_status from users where user_id = ?';
      connection.query(selectStatusQuery, owner_id, (err, status) => {
        if (err) {
          connection.release();
          res.status(500).send({
            status: "fail",
            msg: "get status fail"
          });
          callback("select status query err : " + err, null);
        } else {
          res.status(200).send({
            status: "success",
            data: status[0].user_status,
            msg: "successful get owner status"
          });
          connection.release();
          callback(null, "successful get owner status");
        }
      });
    }
  ];
  async.waterfall(taskArray, (err, result) => {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss// ') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss// ') + result;
      console.log(result);
    }
  });
});


module.exports = router;