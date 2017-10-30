const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');

router.get('/:storeID', (req, res) => {
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
    //3. 트럭 기본정보 가져오기
    (userData, connection, callback) => {
      let selectStoreInfoQuery = 'select * from owners tr ' +
        'inner join users u ' +
        'on u.user_id = ? ' +
        'where tr.owner_id = ?';
      connection.query(selectStoreInfoQuery, [req.params.storeID, req.params.storeID], (err, storeData) => {
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
            reservationCheck: code.NonReservation,
            bookmarkCheck: code.NonBookmark
          };
          callback(null, data, userData, connection);
        }
      });
    },
    //4. 트럭 메뉴정보 가져오기
    (basicInfo, userData, connection, callback) => {
      let selectMenuQuery = 'select * from menu where owner_id = ?';
      connection.query(selectMenuQuery, req.params.storeID, (err, menuData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get menu data error"
          });
          connection.release();
          callback("get menu data err : " + err, null);
        } else {
          let dataList = [];
          for (let i = 0, length = menuData.length; i < length; i++) {
            let data = {
              menuID: menuData[i].menu_id,
              menuTitle: menuData[i].menu_name,
              menuPrice: menuData[i].menu_price,
              menuImageURL: menuData[i].menu_imageURL
            };
            dataList.push(data);
          }
          callback(null, dataList, basicInfo, userData, connection);
        }
      });
    },
    //5. 예약정보가 있는지 확인
    (menuInfo, basicInfo, userData, connection, callback) => {
      let selectReservationQuery = 'select * from reservation where user_id = ? and owner_id = ?';
      connection.query(selectReservationQuery, [userData.userID, req.params.storeID], (err, reservationData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else {
          if (reservationData.length !== 0) {
            basicInfo.reservationCheck = code.ExistReservation;
          }
          callback(null, menuInfo, basicInfo, userData, connection);
        }
      })
    },
    //6. 북마크된 정보가 있는지 확인
    (menuInfo, basicInfo, userData, connection, callback) => {
      let selectBookmarkQuery = 'select * from bookmarks where user_id = ? and owner_id = ?';
      connection.query(selectBookmarkQuery, [userData.userID, req.params.storeID], (err, bookmarkData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get bookmark data error"
          });
          connection.release();
          callback("get bookmark data err : " + err, null);
        } else {
          if (bookmarkData.length !== 0) {
            basicInfo.bookmarkCheck = code.ExistBookmark;
          }
          callback(null, menuInfo, basicInfo, connection);
        }
      })
    },
    //6. 응답후 커넥션 해제
    (menuInfo, basicInfo, connection, callback) => {
      res.status(200).send({
        status: "success",
        data: {
          basicInfo: basicInfo,
          menuInfo: menuInfo
        },
        msg: "successful load store data"
      });
      connection.release();
      callback(null, "successful load store data");
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