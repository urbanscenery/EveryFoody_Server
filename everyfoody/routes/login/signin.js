const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const saltRounds = 17;



//로그인 실제 작동코드
router.post('/', function(req, res) {
  let taskArray = [
    //1. connection 설정
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err){
          res.status(500).send({
            status : "fail",
            msg : "get connection error"
          });
          callback("getConnection error : " + err, null);
        } 
        else callback(null, connection);
      });
    },
    //2. 받은 email과 category로 DB검색
    function(connection, callback) {
      let getMailQuery = 'select * from users where user_email = ? and user_category = ?';
      connection.query(getMailQuery, [req.body.email, req.body.category], function(err, userData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "find user data error"
          });
          connection.release();
          callback("getMailQuery error : " + err, null);
        } else {
          callback(null, userData, connection);
        }
      });
    },
    //3. 찾은 email로 회원가입여부 판정, 회원가입된 회원시 uid 비교
    function(userData, connection, callback) {
      if (userData.length === 0) {
        res.status(401).send({
          status: "fail",
          msg: "non signed up user"
        });
        connection.release();
        callback("non signed up user", null);
      } else {
        bcrypt.compare(req.body.uid, userData[0].user_uid, function(err, signin) {
          if (err) {
            res.status(500).send({
              status: "fail",
              msg: "uid encryption error"
            });
            connection.release();
            callback("uid encryption error : " + err, null);
          } else {
            if (signin) {
              connection.release();
              callback(null, userData);
            } else {
              res.status(401).send({
                status: "fail",
                msg: "uncorrect unique ID"
              });
              connection.release();
              callback("uncorrect uid : " + err, null);
            }
          }
        });
      }
    },
    //4. JWT토큰발행
    function(userData, callback) {
      const secret = req.app.get('jwt-secret');
      let option = {
        algorithm: 'HS256',
        expiresIn: 3600 * 24 * 10 // 토큰의 유효기간이 10일
      };
      let payload = {
	    	userEmail : userData[0].user_email,
	    	userID : userData[0].user_id,
	    	userCategory : userData[0].user_category
	    };
	    let token = jwt.sign(payload, req.app.get('jwt-secret'), option);
	    res.status(201).send({
	    	status : "success",
	    	data : {
	    		token : token
	    	},
	    	msg : "successful login"
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