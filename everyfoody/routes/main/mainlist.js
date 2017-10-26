const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const distance = require('../../modules/distance');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/:location/:latitude/:longitude', function(req, res) {
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
            callback(null, decoded, connection);
            //decoded가 하나의 JSON 객체. 이안에 userEmail userCategory userID 프로퍼티 존
          }
        });
      }
    },
    //3. location, GPS정보로 푸드트럭정보 찾기
    function(decoded, connection, callback) {
      let selectStoreQuery = "select owner_id, owner_storename, owner_mainURL, owner_reservationCount, owner_locationDetail, owner_latitude, owner_longitude " +
        "from owners " +
        "where owner_location = ?";
      connection.query(selectStoreQuery, req.params.location, function(err, storeData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get store data error"
          });
          connection.release();
          callback("get store data err : " + err, null);
        } else {
          let dataList = [];
          let userLatitude = req.params.latitude;
          let userLongitude = req.params.longitude;
          
          for (let i = 0, length = storeData.length; i < length; i++) {
            let data;
            if (storeData[i].owner_latitude === -1) {
              data = {
                storeID: storeData[i].owner_id,
                storeName: storeData[i].owner_storename,
                storeImage: storeData[i].owner_mainURL,
                reservationCount: storeData[i].owner_reservationCount,
                storeLocation: storeData[i].owner_locationDetail,
                storeDistance: -1,
                storeDistanceUnit: "m"
              }
              dataList.push(data);
            } else {
              console.log("Latitude : " + userLatitude + "Longitude : " + userLongitude);
              console.log("store lat : "+storeData[i].owner_latitude +" store long: "+ storeData[i].owner_longitude);
              let distanceData = distance(userLatitude, userLongitude, storeData[i].owner_latitude, storeData[i].owner_longitude);
              console.log(distanceData);
              data = {
                storeID: storeData[i].owner_id,
                storeName: storeData[i].owner_storename,
                storeImage: storeData[i].owner_mainURL,
                reservationCount: storeData[i].owner_reservationCount,
                storeLocation: storeData[i].owner_locationDetail,
                storeDistance: distanceData.distance * 1,
                storeDistanceUnit: distanceData.unit
              }
              dataList.push(data);
            }
          }
          callback(null, dataList, decoded, connection);
        }
      })
    },
    //4. 거리순 정렬
    function(dataList, decoded, connection, callback) {
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
      callback(null, dataList, decoded, connection);
    },
    //5. 
    (dataList, decoded, connection, callback) => {
      let getAccessTime;
      getAccessTime = 'select count(n.notice_time) as c from EveryFoody.notice as n inner join '+
      'EveryFoody.users as u on n.user_id = u.user_id and n.notice_time > u.user_accessTime where u.user_id = ?';
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(getAccessTime, [decoded.userID], function(err, timeData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        }
        else {
          let noticeCode;
          if(timeData[0].c == 1) noticeCode = 801;
          else noticeCode = 802;      
          console.log('timeData'+timeData[0].c); 
          callback(null, dataList, noticeCode, decoded, connection);
        }
      });
    },
    function(dataList, noticeCode, decoded, connection, callback){
      const secret = req.app.get('jwt-secret');
      let option = {
        algorithm: 'HS256',
        expiresIn: 3600 * 24 * 10 // 토큰의 유효기간이 10일
      };
      let payload = {
        userEmail: decoded.userEmail,
        userID: decoded.userID,
        userCategory: decoded.userCategory,
        userName: decoded.userName
      };
      let token = jwt.sign(payload, secret, option);
      callback(null, dataList, noticeCode, token, connection);
    },
    //5. 응답후 커넥션 해제
    function(dataList, noticeCode, token, connection, callback) {
      res.status(200).send({
        status: "success",
        data: {
          store : dataList,
          notice : noticeCode,
          token : token
        },
        msg: "Successful load store list"
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