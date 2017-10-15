const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../modules/AWS-S3');
const fcm = require('../../config/fcm_config')


router.post('/',upload.single('image') ,function(req, res) {
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
            callback(null, decoded, connection);
            //decoded가 하나의 JSON 객체. 이안에 userEmail userCategory userID 프로퍼티 존
          }
        });
      }
    },
    //3. 리뷰 등록
    function(userData, connection, callback){
      let insertReviewQuery = 'insert into reviewes set ?';
      let imageURL;
      if(typeof req.file === "undefined"){
        imageURL = null;
      }else{
        imageURL = req.file.location;
      }
      let reviewData = {
        user_id : userData.userID,
        owner_id : req.body.storeID*1,
        review_score : (req.body.score)*1,
        review_content : req.body.content,
        review_imageURL : imageURL
      };
      console.log(reviewData);
      connection.query(insertReviewQuery, reviewData, function(err){
        if(err){
          res.status(500).send({
            status : "fail",
            msg : "regist review error"
          });
          connection.release();
          callback("regist review error : "+ err, null);
        }
        else{
          res.status(201).send({
            status : "success",
            msg : "successful regist reivew"
          });
          callback(null, userData, connection, "successful regist review");
        }
      });
    },
    //5. FCM메세지 사업자에게 전송
    function(userData, connection, successMsg, callback) {
      let selectOwnerQuery = 'select user_deviceToken from users where user_id = ?';
      connection.query(selectOwnerQuery, req.body.storeID*1, function(err, ownerDeviceToken) {
        if (err) {
          connection.release();
          callback(successMsg + " //get owner devicetoken data err : " + err, null);
        } else {
          let message = {
            to: ownerDeviceToken,
            collapse_key: 'Updates Available',
            data: {
              title: "Every Foody",
              body: userData.userName + "님이 리뷰를 남겼습니다!"
            }
          };
          fcm.send(message, function(err, response){
            if(err){
              connection.release();
              callback(successMsg + " // send push msg error : "+ err, null);
            }
            else{
              connection.release();
              callback(null, successMsg + " // success send push msg : "+ response);
            }
          });
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
})

module.exports = router;