const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

//이름 양식 확인
function chkName(str) {
  var name = /^.*(?=.{1,10})(?=.*[a-zA-Z가-힣0-9]).*$/;
  if (!name.test(str)) {
    return false;
  }
  return true;
}

router.post('/customer', (req, res) => {
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
    //2. 이름 유효성 검사
    (connection, callback) => {
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
    (connection, callback) => {
      let selectEmailQuery = 'select user_email from users where user_email = ? and user_category = ?';
      connection.query(selectEmailQuery, [req.body.email, req.body.category], (err, email) => {
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
    //4. 회원가입 완료
    (connection, callback) => {
      let insertUserDataQuery = 'insert into users values(?,?,?,?,?,?,?,?,?,?)';
      connection.query(insertUserDataQuery, [null, req.body.email, req.body.category, req.body.uid, code.User, req.body.name, req.body.imageURL, req.body.phone, null, null], (err) => {
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

router.post('/owner', (req, res) => {
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
    //2. 이름 유효성 검사
    (connection, callback) => {
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
    (connection, callback) => {
      let selectEmailQuery = 'select user_email from users where user_email = ? and user_category = ?';
      connection.query(selectEmailQuery, [req.body.email, req.body.category], (err, email) => {
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
    //4. 회원가입 완료
    (connection, callback) => {
      let insertUserDataQuery = 'insert into users values(?,?,?,?,?,?,?,?,?,?)';
      connection.query(insertUserDataQuery, [null, req.body.email, req.body.category, req.body.uid, code.NonInfoOwner, req.body.name, req.body.imageURL, req.body.phone, null, null], (err) => {
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


router.get('/checking/:user_uid', (req, res) => {
  let user_uid = req.params.user_uid;
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
      let checkUidquery = 'select count(*) as c from users where user_uid = ?';
      connection.query(checkUidquery, user_uid, (err, resultData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "owner info update error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          let data;
          if (resultData[0].c === 0) data = code.NonUid;
          else data = code.ExistUid;
          res.status(201).send({
            status: "success",
            data: data,
            msg: "checking uid success"
          });
          connection.release();
          callback(null, "checking uid success");
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