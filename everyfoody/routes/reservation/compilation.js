const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fcm = require('../../config/fcm_config')

router.get('/:storeID', function(req, res) {
  var owner_id = req.params.storeID;
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
    //3. userID, storeID로 예약내역 있는지 검사
    function(userData, connection, callback) {
      let selectReservationQuery = 'select * from reservation where user_id = ? and owner_id = ?';
      connection.query(selectReservationQuery, [userData.userID, req.params.storeID], function(err, reservationData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          callback(null, reservationData, userData, connection);
        }
      });
    },
    //4. reservation데이터가 있으면 삭제, 없으면 추가
    function(reservationData, userData, connection, callback) {
      if (reservationData.length === 0) {
        let insertReservationQuery = 'insert into reservation set ?';
        let reservationData = {
          user_id: userData.userID,
          owner_id: req.params.storeID,
          reservation_time: moment().format('YYYYMMDDhhmmss')
        }
        connection.query(insertReservationQuery, reservationData, function(err) {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "insert reservation data error"
            });
            callback("insert reservation data err : " + err, null);
          } else {
            let addCountQuery = 'update owners set owner_reservationCount = owner_reservationCount+1 where owner_id = ?';
            connection.query(addCountQuery, owner_id, function(err) {
              console.log("sefasefaesf");
              if (err) {
                res.status(500).send({
                  status: "fail",
                  msg: "add reservationCount data error"
                });
                connection.release();
                callback("insert reservation data err : " + err, null);
              } else {
                res.status(200).send({
                  status: "success",
                  msg: "successful add reservationCount reservation"
                });
                callback(null, userData, connection, "succesful regist reservation", 303);
              }
            });
          }
        });
      } else {
        let deleteReservationQuery = 'delete from reservation where user_id = ? and owner_id = ?';
        connection.query(deleteReservationQuery, [userData.userID, req.params.storeID], function(err) {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "delete reservation data error"
            });
            connection.release();
            callback("delete reservation data err : " + err, null);
          } else {
            let rmCountQuery = 'update owners set owner_reservationCount = owner_reservationCount-1 where owner_id = ?';
            connection.query(rmCountQuery, owner_id, function(err) {
              if (err) {
                res.status(500).send({
                  status: "fail",
                  msg: "remove reservationcount data error"
                });
                connection.release();
                callback("insert reservation data err : " + err, null);
              } else {
                res.status(200).send({
                  status: "success",
                  msg: "remove reservationcount reservation"
                });
                callback(null, userData, connection, "succesful remove reservation", 304);
              }
            });
          }
        });
      }
    },
    //5. FCM메세지 사업자에게 전송
    function(userData, connection, successMsg, statusCode, callback) {
      let selectOwnerQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectOwnerQuery, req.params.storeID, function(err, ownerDeviceToken) {
        if (err) {
          connection.release();
          callback(successMsg + " //get owner devicetoken data err : " + err, null);
        } else {
          let message;
          if (statusCode === 303) {
            message = {
              to: ownerDeviceToken[0].user_deviceToken,
              collapse_key: 'Updates Available',
              data: {
                title: "Every Foody",
                body: userData.userName + "님이 주문예약을 했습니다!"
              }
            };
          } else {
            message = {
              to: ownerDeviceToken[0].user_deviceToken,
              collapse_key: 'Updates Available',
              data: {
                title: "Every Foody",
                body: userData.userName + "님이 주문예약을 취소했습니다"
              }
            };
          }
          fcm.send(message, function(err, response) {
            if (err) {
              connection.release();
              callback(successMsg + " // send push msg error : " + err, null);
            } else {
              console.log(message);
              connection.release();
              callback(null, successMsg + " // success send push msg : " + response);
            }
          });
        }
      })
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