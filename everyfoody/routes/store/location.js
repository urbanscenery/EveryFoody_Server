const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/:storeID', function(req, res) {
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
    //2. header의 token 값으로 user_email 받아옴.
    function(connection, callback) {
      let token = req.headers.token;
      if (token === "nonLoginUser") {
        let decoded = {
          userEmail: "nonSignin",
          userID: 0,
          userCategory: 0
        }
        callback(null, decoded.userID, connection);
      } else {
        jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
          if (err) {
            res.status(500).send({
              msg: "user authorization error"
            });
            connection.release();
            callback("JWT decoded err : " + err, null);
          } else {
            callback(null, decoded.userID, connection);
            //decoded가 하나의 JSON 객체. 이안에 userEmail userCategory userID 프로퍼티 존
          }
        });
      }
    },
    //3. 푸드트럭 GPS 얻어오기.
    function(userID, connection, callback){
      let selectStoreLocationQuery = 'select owner_id, owner_latitude, owner_longitude, owner_reservationCount '+
        'from owners where owner_id = ?'
      connection.query(selectStoreLocationQuery, req.params.storeID, function(err, locationData){
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get store location error"
          });
          connection.release();
          callback("get store location err : " + err, null);
        }
        else{
          let data = {
            storeID : locationData[0].owner_id,
            storeLatitude : locationData[0].owner_latitude,
            storeLongitude : locationData[0].owner_longitude,
            reservationCount : locationData[0].owner_reservationCount
          }
          callback(null, data, connection);
        }
      });
    },
    //4. 응답 후 커넥션 해제.
    function(locationInfo, connection, callback){
      res.status(200).send({
        status : "success",
        data : locationInfo,
        msg : "successful load loaction data"
      });
      connection.release();
      callback(null, "successful load location data");
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