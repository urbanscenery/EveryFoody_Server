const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
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
    //3. userID, storeID로 북마크 있는지 검사
    function(userID, connection, callback) {
      let selectBookmarkQuery = 'select * from bookmarks where user_id = ? and owner_id = ?';
      connection.query(selectBookmarkQuery, [userID, req.params.storeID], function(err, bookmarkData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        } else {
          callback(null, bookmarkData, userID, connection);
        }
      });
    },
    //4. bookmark데이터가 있으면 삭제, 없으면 추가
    function(bookmarkData, userID, connection, callback) {
      if (bookmarkData.length === 0) {
        let insertBookmarkQuery = 'insert into bookmarks values(?,?)';
        connection.query(insertBookmarkQuery, [userID, req.params.storeID], function(err) {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "insert bookmark data error"
            });
            connection.release();
            callback("insert bookmark data err : " + err, null);
          } else {
          	res.status(201).send({
          		status : "success",
          		msg : "successful regist bookmark"
          	});
            connection.release();
            callback(null, "succesful regist bookmark");
          }
        });
      } else {
        let deleteBookmarkQuery = 'delete from bookmarks where user_id = ? and owner_id = ?';
        connection.query(deleteBookmarkQuery, [userID, req.params.storeID], function(err) {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "delete bookmark data error"
            });
            connection.release();
            callback("delete bookmark data err : " + err, null);
          } else {
          	res.status(201).send({
          		status : "success",
          		msg : "successful delete bookmark"
          	});
            connection.release();
            callback(null, "successful delete bookmark");
          }
        });
      }
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