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
      console.log(token);
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
    //3. 트럭 기본정보 가져오기
    function(userID, connection, callback) {
      let selectStoreInfoQuery = 'select * from owners tr ' +
        'inner join users u ' +
        'on u.user_id = ? ' +
        'where tr.owner_id = ?'; 
      connection.query(selectStoreInfoQuery, [req.params.storeID, req.params.storeID], function(err, storeData) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get store data error"
          });
          connection.release();
          callback("get store data err : " + err, null);
        } else {
          let data = {
            storeID: storeData[0].owner_id,
            storeName: storeData[0].owner_storename,
            storeImage: storeData[0].owner_detailURL,
            storeFacebookURL: storeData[0].owner_facebookURL,
            storeTwitterURL: storeData[0].owner_twitterURL,
            storeInstagramURL: storeData[0].owner_instagramURL,
            storeHashtag: storeData[0].owner_hashtag,
            storeOpentime: storeData[0].owner_opentime,
            storeBreaktime: storeData[0].owner_breaktime,
            storePhone: storeData[0].user_phone,
            reservationCount: storeData[0].owner_reservationCount,
            reservationCheck : 0,
            bookmarkCheck : 0
          };
          callback(null, data, userID, connection);
        }
      });
    },
    //4. 트럭 메뉴정보 가져오기
    function(basicInfo, userID, connection, callback){
      let selectMenuQuery = 'select * from menu where owner_id = ?';
      connection.query(selectMenuQuery, req.params.storeID, function(err, menuData){
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get menu data error"
          });
          connection.release();
          callback("get menu data err : " + err, null);
        }
        else{
          let dataList = [];
          for(let i = 0, length = menuData.length ; i < length ; i++){
            let data = {
              menuID : menuData[i].menu_id,
              menuTitle : menuData[i].menu_name,
              menuPrice : menuData[i].menu_price,
              menuImageURL : menuData[i].menu_imageURL
            };
            dataList.push(data);
          }
          callback(null, dataList, basicInfo, userID, connection);
        }
      });
    },
    //5. 예약정보가 있는지 확인
    function(menuInfo, basicInfo, userID, connection, callback){
      let selectReservationQuery = 'select * from reservation where user_id = ? and owner_id = ?';
      connection.query(selectReservationQuery, [userID, req.params.storeID], function(err, reservationData){
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        }
        else{
          if(reservationData.length !== 0){
            basicInfo.reservationCheck = 1;
          }
          callback(null, menuInfo, basicInfo, userID, connection);
        }
      })
    },
    //6. 북마크된 정보가 있는지 확인
    function(menuInfo, basicInfo, userID, connection, callback){
      let selectBookmarkQuery = 'select * from bookmarks where user_id = ? and owner_id = ?';
      console.log(userID);
      console.log(req.params.storeID);
      connection.query(selectBookmarkQuery, [userID, req.params.storeID], function(err, bookmarkData){
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        }
        else{
          console.log(bookmarkData);
          if(bookmarkData.length !== 0){
            basicInfo.bookmarkCheck = 1;
          }
          callback(null, menuInfo, basicInfo, connection);
        }
      })
    },
    //6. 응답후 커넥션 해제
    function(menuInfo, basicInfo, connection, callback){
      res.status(200).send({
        status : "success",
        data : {
          basicInfo : basicInfo,
          menuInfo : menuInfo
        },
        msg : "successful load store data"
      });
      connection.release();
      callback(null, "successful load store data");
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