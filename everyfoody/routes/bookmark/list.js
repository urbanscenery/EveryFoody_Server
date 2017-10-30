const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const distance = require('../../modules/distance');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

router.get('/:latitude/:longitude', (req, res) => {
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
    //2. header의 token 값으로 user_email 받아옴.
    (connection, callback) => {
      let token = req.headers.token;
      if (token === "apitest") {
        let decoded = {
          userEmail: "API_Test",
          userID: 40,
          userCategory: code.KAKAO,
          userName: "에브리푸디"
        }
        callback(null, decoded, connection);
      } else if (token === "nonLoginUser") {
        let decoded = {
          userEmail: "nonLogin",
          userID: 41,
          userCategory: code.KAKAO,
          userName: "비로그인"
        }
        callback(null, decoded, connection);
      } else {
        jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
          if (err) {
            res.status(500).send({
              msg: "user authorization error"
            });
            connection.release();
            callback("JWT decoded err : " + err, null);
          } else {
            callback(null, decoded, connection);
            //decoded가 하나의 JSON 객체. 이안에 userEmail userCategory userID 프로퍼티 존
          }
        });
      }
    },
    //3. location, GPS정보로 열린 푸드트럭정보 찾기
    (userData, connection, callback) => {
      let selectMarkedStoreQuery = "select * " +
        "from bookmarks mark " +
        "inner join owners tr " +
        "on mark.owner_id = tr.owner_id " +
        "where mark.user_id = ?";
      connection.query(selectMarkedStoreQuery, [userData.userID, userData.userID], (err, markedStoreData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get marked store data error"
          });
          connection.release();
          callback("get marked store data err : " + err, null);
        } else {
          let dataList = [];
          let userLatitude = req.params.latitude;
          let userLongitude = req.params.longitude;
          for (let i = 0, length = markedStoreData.length; i < length; i++) {
            let data;
            if (markedStoreData[i].owner_latitude === -1) {
              data = {
                storeID: markedStoreData[i].owner_id,
                storeName: markedStoreData[i].owner_storename,
                storeImage: markedStoreData[i].owner_mainURL,
                reservationCount: markedStoreData[i].owner_reservationCount,
                storeLocation: markedStoreData[i].owner_locationDetail,
                storeDistance: -1,
                storeDistanceUnit: "m"
              }
              dataList.push(data);
            } else {
              let distanceData = distance(userLongitude, userLatitude, markedStoreData[i].owner_latitude, markedStoreData[i].owner_longitude);
              let data = {
                storeID: markedStoreData[i].owner_id,
                storeName: markedStoreData[i].owner_storename,
                storeImage: markedStoreData[i].owner_mainURL,
                reservationCount: markedStoreData[i].owner_reservationCount,
                storeLocation: markedStoreData[i].owner_locationDetail,
                storeDistance: distanceData.distance * 1,
                storeDistanceUnit: distanceData.unit
              }
              dataList.push(data);
            }
          }
          callback(null, dataList, userData, connection);
        }
      });
    },
    //4. 거리순 정렬
    (dataList, userData, connection, callback) => {
      dataList.sort(function(a, b) { // 오름차순
        if (a.storeDistance === -1 && b.storeDistance === -1) {
          return -1;
        } else if (a.storeDistance === -1 && b.storeDistance > 0) {
          return 1;
        } else if (a.storeDistance > 0 && b.storeDistance === -1) {
          return -1;
        } else if (a.storeDistanceUnit === 'Km' && b.storeDistanceUnit === 'm') {
          return 1;
        } else if (a.storeDistanceUnit === 'm' && b.storeDistanceUnit === 'Km') {
          return -1;
        } else if (a.storeDistance >= b.storeDistance) {
          return 1;
        } else {
          return -1;
        }
      });
      callback(null, dataList, connection);
    },
    //5. 응답후 커넥션 해제
    (dataList, connection, callback) => {
      res.status(200).send({
        status: "success",
        data: {
          store: dataList
        },
        msg: "Successful load bookmark store list"
      });
      connection.release();
      callback(null, "Successful load bookmark store list");
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