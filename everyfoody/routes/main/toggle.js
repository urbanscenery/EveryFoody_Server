const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

// 사용자 토글 닫기
router.put('/user/closing/:owner_id', (req, res) => {
  var owner_id = req.params.owner_id;
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
              status: 'fail',
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
      let selectReservationQuery;
      selectReservationQuery = 'UPDATE bookmarks SET bookmark_toggle = ? where user_id = ? and owner_id = ?';
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(selectReservationQuery, [code.ToogleOff, userData.userID, owner_id], (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: 'success',
            msg: "change bookmark status"
          });
          callback(null, "Successful change bookmark status");
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

// 사용자 토글 열기
router.put('/user/opening/:owner_id', (req, res) => {
  var owner_id = req.params.owner_id;
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
      let selectReservationQuery;
      selectReservationQuery = 'UPDATE bookmarks SET bookmark_toggle = ? where user_id = ? and owner_id = ?';
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(selectReservationQuery, [code.ToogleOn, userData.userID, owner_id], (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: 'success',
            msg: "change bookmark status"
          });
          callback(null, "Successful change bookmark status");
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

// 사업자 토글 열기
router.put('/owner/opening/:kind', (req, res) => {
  var kind = req.params.kind;
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
      let selectReservationQuery;
      if (Number(kind) === code.ToogleTurn) selectReservationQuery = 'UPDATE owners SET owner_addorder = ? where owner_id = ?';
      if (Number(kind) === code.ToogleReview) selectReservationQuery = 'UPDATE owners SET owner_addreview = ? where owner_id = ?';
      if (Number(kind) === code.ToogleBookmark) selectReservationQuery = 'UPDATE owners SET owner_addbookmark = ? where owner_id = ?';
      connection.query(selectReservationQuery, [code.ToogleOn, userData.userID], (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: 'success',
            msg: "change bookmark status"
          });
          callback(null, "Successful change bookmark status");
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

//사업자 토글 닫기
router.put('/owner/closing/:kind', (req, res) => {
  var kind = req.params.kind * 1;
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
      let selectReservationQuery;
      if (Number(kind) === code.ToogleTurn) selectReservationQuery = 'UPDATE owners SET owner_addorder = ? where owner_id = ?';
      if (Number(kind) === code.ToogleReview) selectReservationQuery = 'UPDATE owners SET owner_addreview = ? where owner_id = ?';
      if (Number(kind) === code.ToogleBookmark) selectReservationQuery = 'UPDATE owners SET owner_addbookmark = ? where owner_id = ?';
      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(selectReservationQuery, [code.ToogleOff, userData.userID], (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: 'success',
            msg: "change  status"
          });
          callback(null, "Successful change bookmark status");
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