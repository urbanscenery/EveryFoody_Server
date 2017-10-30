const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../modules/AWS-S3');
const fcm = require('../../config/fcm_config');
const code = require('../../modules/statuscode');



router.post('/', upload.single('image'), (req, res) => {
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
    //3. 리뷰 등록
    (userData, connection, callback) => {
      let insertReviewQuery = 'insert into reviewes set ?';
      let imageURL;
      if (typeof req.file === "undefined") {
        imageURL = null;
      } else {
        imageURL = req.file.location;
      }
      let reviewData = {
        user_id: userData.userID,
        owner_id: Number(req.body.storeID),
        review_score: Number(req.body.score),
        review_content: req.body.content,
        review_imageURL: imageURL
      };
      connection.query(insertReviewQuery, reviewData, (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "regist review error"
          });
          connection.release();
          callback("regist review error : " + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "successful regist reivew"
          });
          callback(null, userData, connection, "successful regist review");
        }
      });
    },
    //5. FCM메세지 사업자에게 전송
    (userData, connection, successMsg, callback) => {
      let selectOwnerQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectOwnerQuery, Number(req.body.storeID), (err, ownerDeviceToken) => {
        if (err) {
          connection.release();
          callback(successMsg + " //get owner devicetoken data err : " + err, null);
        } else {
          let message = {
            to: ownerDeviceToken[0].user_deviceToken,
            collapse_key: 'Updates Available',
            data: {
              title: "새로운 리뷰 등록",
              body: userData.userName + "님이 리뷰를 남겼습니다!"
            }
          };
          callback(null, userData, connection, successMsg, message);
        }
      });
    },
    //6. FCM 전송 및 notice list 추가
    (userData, connection, successMsg, FCM, callback) => {
      let notice = {
        id: null,
        user_id: req.params.storeID,
        notice_content: FCM.data.body,
        notice_time: moment().format('YYYYMMDDHHmmss')
      };
      let insertNoticeQuery = 'insert into notice set ?';
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
})

module.exports = router;