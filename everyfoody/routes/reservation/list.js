const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const distance = require('../../modules/distance');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/', function(req, res) {
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
        callback(null, decoded, connection);
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
          }
        });
      }
    },
    //3. location, GPS정보로 푸드트럭정보 찾기
    function(userID, connection, callback) {
      let selectStoreQuery = "select tr.owner_id, tr.owner_storename, tr.owner_imageURL, tr.owner_reservationCount, res.reservation_time " +
        "from owners tr " +
        "inner join reservation res " +
        "on tr.owner_id = res.owner_id " +
        "where res.user_id = ? "+
        "order by res.reservation_time desc";
      connection.query(selectStoreQuery, userID ,function(err, storeData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation store data error"
          });
          connection.release();
          callback("get reservation store data err : " + err, null);
        } else {
          let dataList = [];
          for (let i = 0, length = storeData.length; i < length; i++) {
            let data = {
              storeID: storeData[i].owner_id,
              storeName: storeData[i].owner_storename,
              storeImage: storeData[i].owner_imageURL,
              reservationCount: storeData[i].owner_reservationCount,
              reservationTime : storeData[i].reservation_time
            }
            dataList.push(data);
          }
          callback(null, dataList, connection);
        }
      })
    },
    //4. 응답후 커넥션 해제
    function(dataList, connection, callback){
      res.status(200).send({
        status : "success",
        data : dataList,
        msg : "Successful load reservation list"
      });
      connection.release();
      callback(null, "Successful load reservation list");
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

});

module.exports = router;