const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/', function(req, res){
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
    //3. 예약내역 갯수 불러오기.
    function(userID, connection, callback){
    	let selectReservationQuery = 'select * from reservation where user_id = ?';
    	connection.query(selectReservationQuery, userID, function(err, reservationData){
    		if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else{
        	let responseData = {
        		reservationCount : reservationData.length,
        		bookmarkCount : 0
        	}
        	callback(null, responseData, userID, connection);
        }
    	});
    },
    //4. 북마크 갯수 불러오기.
    function(responseData, userID, connection, callback){
    	let selectBookmarkQuery = 'select * from bookmarks where user_id = ?';
    	connection.query(selectBookmarkQuery, userID, function(err, bookmarkData){
    		if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        } else{
        	responseData.bookmarkCount = bookmarkData.length;
        	res.status(200).send({
        		status : "success",
        		data : responseData,
        		msg : "Successful load sidemenu data"
        	});
        	connection.release();
        	callback(null, "Successful load sidemenu data");
        }
    	});
    }
	];
	async.waterfall(taskArray, function(err, result) {
    if (err){
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    }
    else{
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  });
})

module.exports = router;