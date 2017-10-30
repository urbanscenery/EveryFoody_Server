const async = require('async');
const mysql = require('mysql');
const moment = require('moment');
const pool = require('../../config/db_pool');
const express = require('express');
const router = express.Router();

router.get('/:ownerID', function(req, res) {

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    function(connection, callback) {
      let updateOwnerQuery = 'update users set user_status = ? where user_id = ?';
      connection.query(updateOwnerQuery, [402, req.params.ownerID], (err) => {
        if (err) {
          connection.release();
          callback("update owner status query error : " + err, null);
        } else {
          callback(null, connection, "successful update owner status");
        }
      });
    },
    function(connection, successMSG, callback) {
      let selectDeviceTokenQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectDeviceTokenQuery, req.params.ownerID, function(err, token) {
        if (err) {
          connection.release();
          callback('select device token query error : ' + err);
        } else {
          callback(null, connection, successMSG, token[0].user_deviceToken);
        }
      });
    },
    function(connection, successMSG, deviceToken, callback) {
      let message = {
        to: deviceToken,
        collapse_key: 'Updates Available',
        data: {
          title: "가게 인증 완료 알림",
          body: "가게 인증이 완료되었습니다! 가게 상세정보를 입력해주세요!"
        }
      };
      fcm.send(message, function(err, response) {
        if (err) {
          connection.release();
          callback(successMsg + " // send push msg error : " + err, null);
        } else {
          connection.release();
          callback(null, successMsg + " // success send push msg : " + response);
        }
      });
    }
  ];
  async.waterfall(taskArray, function(err, result) {
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