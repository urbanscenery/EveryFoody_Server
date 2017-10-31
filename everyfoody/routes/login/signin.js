const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');



//로그인 실제 작동코드
router.post('/', (req, res) => {
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
    //2. 받은 email과 category로 DB검색
    (connection, callback) => {
      let getMailQuery = 'select * from users where user_email = ? and user_category = ?';
      connection.query(getMailQuery, [req.body.email, req.body.category], (err, userData) => {
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
    (userData, connection, callback) => {
      if (userData.length === 0) {
        res.status(401).send({
          status: "fail",
          msg: "non signed up user"
        });
        connection.release();
        callback("non signed up user", null);
      } else {
        if (userData[0].user_uid === req.body.uid) {
          let updateDeviceToken = 'update users set user_deviceToken = ? where user_id = ?';
          connection.query(updateDeviceToken, [req.body.deviceToken, userData[0].user_id], (err) => {
            if (err) {
              res.status(500).send({
                status: "fail",
                msg: "update device token error"
              });
              connection.release();
              callback("update device token error", null);
            } else {
              console.log(userData[0].user_id);
              console.log("update Token!!");
              connection.release();
              callback(null, userData);
            }
          });
        } else {
          res.status(401).send({
            status: "fail",
            msg: "uncorrect unique ID"
          });
          connection.release();
          callback("uncorrect uid : ", null);
        }
      }
    },
    //4. JWT토큰발행
    (userData, callback) => {
      let categoryString = "KAKAO ";
      let statusString = "customer ";
      if (userData[0].user_category === code.Facebook) {
        categoryString = "Facebook ";
      }
      if (userData[0].user_status > code.User) {
        statusString = "owner ";
      }
      const secret = req.app.get('jwt-secret');
      let option = {
        algorithm: 'HS256',
        expiresIn: 3600 * 24 * 60 // 토큰의 유효기간이 60일
      };
      let payload = {
        userEmail: userData[0].user_email,
        userID: userData[0].user_id,
        userCategory: userData[0].user_category,
        userName: userData[0].user_nickname
      };
      let token = jwt.sign(payload, secret, option);
      res.status(201).send({
        status: "success",
        data: {
          token: token,
          name: userData[0].user_nickname,
          category: userData[0].user_status,
          imageURL: userData[0].user_imageURL
        },
        msg: "successful " + statusString + categoryString + "login"
      });
      callback(null, "successful " + statusString + categoryString + "login");
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