const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

router.get('/:user_status', (req, res) => {
  let user_status = req.params.user_status;
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
    //3. 예약내역 갯수 불러오기.
    (userData, connection, callback) => {
      let selectReservationQuery;
      if (Number(user_status) === code.User) selectReservationQuery = 'select * from reservation where user_id = ?';
      else if (user_status > code.User) selectReservationQuery = 'select * from reservation where owner_id = ?';

      // 사용자의 경우 예약 내역, 사업자의 경우 순번 내역
      connection.query(selectReservationQuery, userData.userID, (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          let responseData = {
            reservationCount: reservationData.length,
            bookmarkCount: 0,
            bookmarkInfo: [],
            imageURL: '',
          }
          callback(null, responseData, userData, connection);
        }
      });
    },
    //4. 북마크 갯수 불러오기. 사용자일 경우 자신의 북마크 개수, 사업자일 경우 자신을 북마크한 사람들 수
    (responseData, userData, connection, callback) => {
      let selectBookmarkQuery;
      if (Number(user_status) === code.User) selectBookmarkQuery = 'select b.owner_id, o.owner_storename, b.bookmark_toggle FROM bookmarks as b inner join owners as o on o.owner_id = b.owner_id where user_id = ?';
      else if (user_status > code.User) selectBookmarkQuery = 'select count(*) as c from bookmarks where owner_id = ?';
      connection.query(selectBookmarkQuery, userData.userID, (err, bookmarkData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        } else {
          if (Number(user_status) === code.User) {
            let bookmarkinfo = [];
            for (let i = 0; i < bookmarkData.length; ++i) {
              bookmarkinfo.push({
                id: bookmarkData[i].owner_id,
                store_name: bookmarkData[i].owner_storename,
                toggle: bookmarkData[i].bookmark_toggle
              });
            }
            responseData.bookmarkInfo = bookmarkinfo;
          }
          responseData.bookmarkCount = bookmarkData.length;
          callback(null, responseData, userData, connection);
        }
      });
    },
    (responseData, userData, connection, callback) => {
      if (user_status > code.User) {
        let toggleQuery = "select owner_addorder, owner_addreview, owner_addbookmark from owners where owner_id = ?";
        connection.query(toggleQuery, userData.userID, (err, toggleData) => {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "get bookmark data error"
            });
            connection.release();
            callback("get bookmark data err : " + err, null);
          } else {
            let toggleStatus = [toggleData[0].owner_addorder, toggleData[0].owner_addreview, toggleData[0].owner_addbookmark];
            responseData.toggleStatus = toggleStatus;
            callback(null, userData, responseData, connection);
          }
        });
      } else callback(null, userData, responseData, connection);
    },
    (userData, responseData, connection, callback) => {
      let selectImageQuery = 'select user_imageURL from users where user_id = ?';
      connection.query(selectImageQuery, [userData.userID], (err, imageData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "drawer get infomation error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          responseData.imageURL = imageData[0].user_imageURL;
          res.status(200).send({
            status: "success",
            msg: "drawer get infomation success",
            data: responseData
          });
          connection.release();
          callback(null, 'drawer success');
        }
      });
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