const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const code = require('../../modules/statuscode');


router.get('/', (req, res) => {
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
          }
        });
      }
    },
    //3. location, GPS정보로 푸드트럭정보 찾기
    (userData, connection, callback) => {
      let selectStoreQuery = "select tr.owner_id, tr.owner_storename, tr.owner_reservationCount, tr.owner_mainURL, res.reservation_time " +
        "from owners as tr " +
        "inner join reservation as res " +
        "on tr.owner_id = res.owner_id " +
        "where res.user_id = ? " +
        "order by res.reservation_time desc";
      connection.query(selectStoreQuery, userData.userID, (err, storeData) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "get reservation store data error"
          });
          connection.release();
          callback("get reservation store data err : " + err, null);
        } else {
          let dataList = [];
          for (let i = 0, length = storeData.length; i < length; i++) {
            let data = {
              storeID: storeData[i].owner_id,
              storeName: storeData[i].owner_storename,
              storeImage: storeData[i].owner_mainURL,
              reservationCount: storeData[i].owner_reservationCount,
              reservationTime: moment(storeData[i].reservation_time, "YYYYMMDDHHmmss").format('YYYY-MM-DD HH:mm:ss')
            }
            dataList.push(data);
          }
          callback(null, dataList, connection);
        }
      })
    },
    //4. 응답후 커넥션 해제
    (dataList, connection, callback) => {
      res.status(200).send({
        status: "success",
        data: dataList,
        msg: "Successful load reservation list"
      });
      connection.release();
      callback(null, "Successful load reservation list");
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