const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const distance = require('../../modules/distance');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/:latitude/:longitude', function(req, res) {
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
            //decoded가 하나의 JSON 객체. 이안에 userEmail userCategory userID 프로퍼티 존
          }
        });
      }
    },
    //3. location, GPS정보로 열린 푸드트럭정보 찾기
    function(userID, connection, callback) {
      console.log(userID);
      let selectOpenStoreQuery = "select * "+
        "from bookmarks mark "+
        "inner join opentruck open "+
        "on mark.owner_id = open.owner_id and mark.user_id = ? "+
        "inner join owners tr "+
        "on mark.owner_id = tr.owner_id "+
        "where mark.user_id = ?";
      connection.query(selectOpenStoreQuery, [userID, userID] ,function(err, openStoreData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get open store data error"
          });
          connection.release();
          callback("get open store data err : " + err, null);
        } else {
          let dataList = [];
          let userLatitude = req.params.latitude;
          let userLongitude = req.params.longitude;
          for (let i = 0, length = openStoreData.length; i < length; i++) {
            let distanceData = distance(userLongitude, userLatitude, openStoreData[i].opentruck_latitude, openStoreData[i].opentruck_longitude);
            let data = {
              storeID: openStoreData[i].owner_id,
              storeName: openStoreData[i].owner_storename,
              storeImage: openStoreData[i].owner_imageURL,
              reservationCount: openStoreData[i].owner_reservationCount,
              storeLocation: openStoreData[i].owner_locationDetail,
              storeDistance: distanceData.distance*1,
              storeDistanceUnit: distanceData.unit
            }
            dataList.push(data);
          }
          callback(null, dataList, userID, connection);
        }
      })
    },
    //4. 거리순 정렬
    function(dataList, userID, connection, callback) {
      dataList.sort(function(a, b) { // 오름차순
        if (a.storeDistanceUnit === 'Km' && b.storeDistanceUnit === 'm') {
          return 1;
        } else if (a.storeDistanceUnit === 'm' && b.storeDistanceUnit === 'Km') {
          return -1;
        } else if (a.storeDistance >= b.storeDistance) {
          return 1;
        } else {
          return -1;
        }
      });
      callback(null, dataList, userID, connection);
    },
    //5. location, GPS정보로 닫힌 푸드트럭정보 찾기
    function(dataList, userID, connection, callback) {
      let selectCloseStoreQuery = "select * "+
        "from bookmarks mark "+
        "inner join opentruck open "+
        "on mark.owner_id != open.owner_id and mark.user_id = ? "+
        "inner join owners tr "+
        "on mark.owner_id = tr.owner_id "+
        "where mark.user_id = ?";
      connection.query(selectCloseStoreQuery, [userID, userID] ,function(err, closeStoreData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get close store data error"
          });
          connection.release();
          callback("get close store data err : " + err, null);
        } else {
          for (let i = 0, length = closeStoreData.length; i < length; i++) {
            let data = {
              storeID: closeStoreData[i].owner_id,
              storeName: closeStoreData[i].owner_storename,
              storeImage: closeStoreData[i].owner_imageURL,
              reservationCount: closeStoreData[i].owner_reservationCount,
              storeLocation: closeStoreData[i].owner_locationDetail,
              storeDistance: -1,
              storeDistanceUnit: "m"
            }
            dataList.push(data);
          }
          callback(null, dataList, connection);
        }
      })
    },
    //5. 응답후 커넥션 해제
    function(dataList, connection, callback){
      res.status(200).send({
        status : "success",
        data : dataList,
        msg : "Successful load store list"
      });
      connection.release();
      callback(null, "Successful load store list");
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