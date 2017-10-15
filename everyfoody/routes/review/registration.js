const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../module/AWS-S3');


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
        callback(null, decoded.userID, connection);
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
    //3. 리뷰 등록
    function(userID, connection, callback){
      let insertReviewQuery = 'insert into reviewes set ?';
      let imageURL;
      if(typeof req.file === "undefined"){
        imageURL = null;
      }else{
        imageURL = req.file.location;
      }
      let reviewData = {
        user_id : userID,
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
          connection.release();
          callback(null, "successful regist review");
        }
      });
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