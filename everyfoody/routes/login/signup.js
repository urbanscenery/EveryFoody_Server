const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const saltRounds = 17;

//이름 양식 확인
function chkName(str) {
  var name = /^.*(?=.{1,10})(?=.*[a-zA-Z가-힣0-9]).*$/;
  if (!name.test(str)) {
    return false;
  }
  return true;
}

router.post('/customer', function(req, res) {
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
    //2. 이름 유효성 검사
    function(connection, callback) {
      if (!chkName(req.body.name)) {
        res.status(400).send({
          status: "fail",
          msg: "Useless name"
        });
        connection.release();
        callback("Useless name", null);
      } else {
        callback(null, connection);
      }
    },
    //3. email 중복검사
    function(connection, callback) {
      let selectEmailQuery = 'select user_email from users where user_email = ? and user_category = ?';
      connection.query(selectEmailQuery, [req.body.email, req.body.category], function(err, email) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
          connection.release();
          callback("selectEmailQuery error : " + err, null);
        } else {
          if (email.length !== 0) {
            res.status(401).send({
              status: "fail",
              msg: "email overlap"
            });
            connection.release();
            callback("email overlap", null);
          } else {
            callback(null, connection);
          }
        }
      });
    },
    //4. uid 암호화
    function(connection, callback) {
      bcrypt.hash(req.body.uid, saltRounds, function(err, hash) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "uid hash error"
          });
          connection.release();
          callback("uid hash error : " + err, null);
        } else {
          callback(null, hash, connection);
        }
      });
    },
    //5. 회원가입 완료
    function(hashUID, connection, callback) {
      let insertUserDataQuery = 'insert into users values(?,?,?,?,?,?,?,?,?)';
      connection.query(insertUserDataQuery, [null, req.body.email, req.body.category, hashUID, 1, req.body.name, null, req.body.phone, null], function(err) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "insert user data error"
          });
          connection.release();
          callback("insertUserDataQuery error : " + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "successful customer sign up"
          });
          connection.release();
          callback(null, "successful customer signup");
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
});

router.post('/owner', function(req, res) {
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
    //2. 이름 유효성 검사
    function(connection, callback) {
      if (!chkName(req.body.name)) {
        res.status(400).send({
          status: "fail",
          msg: "Useless name"
        });
        connection.release();
        callback("Useless name", null);
      } else {
        callback(null, connection);
      }
    },
    //3. email 중복검사
    function(connection, callback) {
      let selectEmailQuery = 'select user_email from users where user_email = ? and user_category = ?';
      connection.query(selectEmailQuery, [req.body.email, req.body.category], function(err, email) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
          connection.release();
          callback("selectEmailQuery error : " + err, null);
        } else {
          if (email.length !== 0) {
            res.status(401).send({
              status: "fail",
              msg: "email overlap"
            });
            connection.release();
            callback("email overlap", null);
          } else {
            callback(null, connection);
          }
        }
      });
    },
    //4. uid 암호화
    function(connection, callback) {
      bcrypt.hash(req.body.uid, saltRounds, function(err, hash) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "uid hash error"
          });
          connection.release();
          callback("uid hash error : " + err, null);
        } else {
          callback(null, hash, connection);
        }
      });
    },
    //5. 회원가입 완료
    function(hashUID, connection, callback) {
      let insertUserDataQuery = 'insert into users values(?,?,?,?,?,?,?,?,?)';
      connection.query(insertUserDataQuery, [null, req.body.email, req.body.category, hashUID, 3, req.body.name, null, req.body.phone,null], function(err) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "insert user data error"
          });
          connection.release();
          callback("insertUserDataQuery error : " + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "successful customer sign up"
          });
          connection.release();
          callback(null, "successful owner signup");
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
});


module.exports = router;