const async = require('async');
const mysql = require('mysql');
const moment = require('moment');
const pool = require('../../config/db_pool');
const express = require('express');
const router = express.Router();
const fcm = require('../../config/fcm_config');
const code = require('../../modules/statuscode');

router.get('/:ownerID', (req, res) => {

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    (connection, callback) => {
      let updateOwnerQuery = 'update users set user_status = ? where user_id = ?';
      connection.query(updateOwnerQuery, [code.NonInfoOwner, req.params.ownerID], (err) => {
        if (err) {
          connection.release();
          callback("update owner status query error : " + err, null);
        } else {
          callback(null, connection, "successful update owner status");
        }
      });
    },
    (connection, successMSG, callback) => {
      let deleteTruckQuery = 'delete from owners where owner_id = ?';
      connection.query(deleteTruckQuery, req.params.ownerID, (err) => {
        if (err) {
          connection.release();
          callback(successMSG + " // delete truck query error : " + err, null);
        } else {
          callback(null, connection, successMSG + " // delete done ");
        }
      })
    },
    (connection, successMSG, callback) => {
      let selectDeviceTokenQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectDeviceTokenQuery, req.params.ownerID, (err, token) => {
        if (err) {
          connection.release();
          callback('select device token query error : ' + err, null);
        } else {
          callback(null, connection, successMSG, token[0].user_deviceToken);
        }
      });
    },
    (connection, successMSG, deviceToken, callback) => {
      let message = {
        to: deviceToken,
        collapse_key: 'Updates Available',
        data: {
          title: "가게 인증 실패 알림",
          body: "가게 인증이 거절되었습니다. 영업허가증 확인후 다시 등록해주세요."
        }
      };
      fcm.send(message, (err, response) => {
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