const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const distance = require('../../modules/distance');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

// 알림 리스트
router.put('/lists', (req, res) => {
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
    (userData, connection, callback) => {
      let noticeListQuery;
      noticeListQuery = 'UPDATE users set user_accessTime = ? where user_id = ?';
      let currentTime = moment().format('MM/DDahh:mm:ss');
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(noticeListQuery, [currentTime, userData.userID], (err, noticeData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          callback(null, userData, connection);
        }
      });
    },
    (userData, connection, callback) => {
      let noticeListQuery;
      noticeListQuery = 'select * from notice where user_id = ? order by notice_time desc';
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(noticeListQuery, [userData.userID], (err, noticeData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "notice list data error",
            data: ""
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          let noticeList = [];
          for (let i = 0; i < noticeData.length; i++) {
            let notice = {
              id: noticeData[i].id,
              user_id: noticeData[i].user_id,
              notice_content: noticeData[i].notice_content,
              notice_time: moment(noticeData[i].notice_time, "YYYYMMDDHHmmss").format('YYYY-MM-DD HH:mm:ss')
            }
            noticeList.push(notice)
          }
          res.status(200).send({
            status: 'success',
            data: noticeList,
            msg: "change bookmark status"
          });
          callback(null, "Successful notice list");
        }
      });
    }
  ]
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

// 알림 추가
router.get('/addition', (req, res) => {
  let notice_content = req.body.notice_content;
  let notice_time = moment().format('MM/DDahh:mm:ss//');
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
    (userData, connection, callback) => {
      let addnoticeQuery;
      addnoticeQuery = 'insert into notice values(? ,? ,?)';
      connection.query(addnoticeQuery, [userData.userID, notice_content, notice_time], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "addition noticeData data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: 'success',
            msg: "addition noticeData"
          });
          connection.release();
          callback(null, "Successful caddition noticeData");
        }
      });
    }
  ]
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