const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fcm = require('../../config/fcm_config')
const notifunc = require('../../modules/notisave.js');
const code = require('../../modules/statuscode');

router.get('/:storeID', (req, res) => {
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
    //3. userID, storeID로 북마크 있는지 검사
    (userData, connection, callback) => {
      let selectBookmarkQuery = 'select * from bookmarks where user_id = ? and owner_id = ?';
      connection.query(selectBookmarkQuery, [userData.userID, req.params.storeID], (err, bookmarkData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        } else {
          callback(null, bookmarkData, userData, connection);
        }
      });
    },
    //4. bookmark데이터가 있으면 삭제, 없으면 추가
    (bookmarkData, userData, connection, callback) => {
      if (bookmarkData.length === 0) {
        let insertBookmarkQuery = 'insert into bookmarks values(?,?,?)';
        connection.query(insertBookmarkQuery, [userData.userID, req.params.storeID, 1], (err) => {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "insert bookmark data error"
            });
            connection.release();
            callback("insert bookmark data err : " + err, null);
          } else {
            res.status(201).send({
              status: "success",
              msg: "successful regist bookmark"
            });
            callback(null, userData, connection, "succesful regist bookmark", code.Regist);
          }
        });
      } else {
        let deleteBookmarkQuery = 'delete from bookmarks where user_id = ? and owner_id = ?';
        connection.query(deleteBookmarkQuery, [userData.userID, req.params.storeID], (err) => {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "delete bookmark data error"
            });
            connection.release();
            callback("delete bookmark data err : " + err, null);
          } else {
            res.status(201).send({
              status: "success",
              msg: "successful delete bookmark"
            });
            callback(null, userData, connection, "successful delete bookmark", code.Delete);
          }
        });
      }
    },
    //5. FCM메세지 설정
    (userData, connection, successMsg, statusCode, callback) => {
      let selectOwnerQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectOwnerQuery, req.params.storeID, (err, ownerDeviceToken) => {
        if (err) {
          connection.release();
          callback(successMsg + " //get owner devicetoken data err : " + err, null);
        } else {
          let message = {
            to: ownerDeviceToken[0].user_deviceToken,
            collapse_key: 'Updates Available',
            data: {
              title: "즐겨찾기 추가 알림",
              body: userData.userName + "님이 가게를 즐겨찾기에 추가했습니다!"
            }
          };
          callback(null, userData, connection, successMsg, statusCode, message);
        }
      });
    },
    //6. FCM전송 및 notice list 추가
    (userData, connection, successMsg, statusCode, FCM, callback) => {
      let notice = {
        id: null,
        user_id: req.params.storeID,
        notice_content: FCM.data.body,
        notice_time: moment().format('YYYYMMDDHHmmss')
      };
      let insertNoticeQuery = 'insert into notice set ?';
      if (statusCode === code.Regist) {
        connection.query(insertNoticeQuery, notice, (err) => {
          if (err) {
            connection.release();
            callback(successMsg + " // Save notice error : " + err, null);
          } else {
            fcm.send(FCM, (err, response) => {
              if (err) {
                connection.release();
                callback(successMsg + " // send push msg error : " + err, null);
              } else {
                connection.release();
                callback(null, successMsg + " // success send push msg : " + response);
              }
            });
          }
        });
      } else {
        connection.release();
        callback(null, successMsg);
      }
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