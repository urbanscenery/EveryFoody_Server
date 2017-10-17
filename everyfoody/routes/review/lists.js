const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
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
    //3. 리뷰 리스트 가져오기
    function(userID, connection, callback) {
      let selectReviewQuery = 'select r.review_score, r.review_content, r.review_imageURL, u.user_nickname from reviewes r ' +
        'inner join users u ' +
        'on r.user_id = u.user_id ' +
        'where r.owner_id = ?';
      connection.query(selectReviewQuery, req.params.storeID, function(err, reviewData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get review data error"
          });
          connection.release();
          callback("get reiew data err : " + err, null);
        } else {
          let dataList = [];
          for (let i = 0, length = reviewData.length; i < length; i++) {
            let data = {
              reviewWriter: reviewData[i].user_nickname,
              reviewScore: reviewData[i].review_score,
              reviewContent: reviewData[i].review_content,
              reviewImageUrl: reviewData[i].review_imageURL
            }
            dataList.push(data);
          }
          callback(null, dataList, connection);
        }
      });
    },
    //4. 응답후 커넥션해제
    function(reviewData, connection, callback) {
      res.status(200).send({
        status : "success",
        data : {
          storeID : req.params.storeID,
          reviews : reviewData
        },
        msg : "successful load reviewes data"
      });
      connection.release();
      callback(null, "successful load reviewes data");
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