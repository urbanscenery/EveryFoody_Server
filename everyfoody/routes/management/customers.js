const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const notifunc = require('../../modules/notisave.js');
const code = require('../../modules/statuscode');
const fcm = require('../../config/fcm_config');
const express = require('express');
const router = express.Router();


router.get('/lists', (req, res) => {

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorization error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else {
          callback(null, decoded.userID, connection);
        }
      });
    },
    (owner_id, connection, callback) => {
      let customerlistQuery = 'select u.user_nickname, u.user_phone ,r.reservation_time, u.user_id from users u inner join reservation r on u.user_id = r.user_id where r.owner_id = ? order by reservation_time';
      connection.query(customerlistQuery, owner_id, (err, lists) => {
        if (err) {
          callback("Data is null or connection error" + err, null);
          connection.release();
        } else {
          let userList = [];
          for (let i = 0; i < lists.length; i++) {
            let data = {
              user_nickname: lists[i].user_nickname,
              user_phone: lists[i].user_phone,
              reservation_time: moment(lists[i].reservation_time, "YYYYMMDDHHmmss").format('YYYY-MM-DD HH:mm:ss'),
              user_id: lists[i].user_id
            }
            userList.push(data);
          }
          res.status(200).send({
            status: "success",
            data: userList,
            msg: "customer list get success"
          });
          connection.release();
          callback(null, "customer list get success");
        }
      });
    }
  ];
  async.waterfall(taskArray, (err, result) => {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss// ') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss// ') + result;
      console.log(result);
    }
  });
});

router.delete('/lists/remove', (req, res) => {
  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorization error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else {
          callback(null, decoded.userID, connection);
        }
      });
    },
    (owner_id, connection, callback) => {
      let customerlistQuery = 'select o.owner_storename, u.user_deviceToken, u.user_nickname, r.reservation_time, u.user_id from users u ' +
        'inner join reservation r inner join owners o ' +
        'on u.user_id = r.user_id and r.owner_id = o.owner_id where r.owner_id = ? order by reservation_time';
      connection.query(customerlistQuery, owner_id, (err, pushList) => {
        if (err) {
          callback("Data is null or connection error1" + err, null);
          connection.release();
        } else {
          let messegeBox = []
          let notiBox = []
          let length = pushList.length;
          messegeBox = notifunc.sendMessege(length, messegeBox, pushList);
          notiBox = notifunc.saveMessege(notiBox, pushList);
          for (let i = 0; i < messegeBox.length; ++i) {
            fcm.send(messegeBox[i].messege, (err, response) => {
              if (err) {
                res.status(501).send({
                  status: "fail",
                  msg: "user authorization error"
                });
                connection.release();
                callback("Something has gone wrong!" + err, null);
              }
            });
          }
          callback(null, owner_id, pushList, notiBox, connection);
        }
      });
    },
    (owner_id, pushList, notiBox, connection, callback) => {
      let notiSaveQuery = '';
      notiSaveQuery = "insert into notice(user_id, notice_content, notice_time) values ";
      for (let i = 0; i < notiBox.length; ++i)
        notiSaveQuery += "(" + notiBox[i].user_id + ",'" + notiBox[i].notice_content + "','" + notiBox[i].notice_time + "'),";
      notiSaveQuery = notiSaveQuery.substring(0, notiSaveQuery.length - 1);
      connection.query(notiSaveQuery, (err) => {
        if (err) {
          connection.release();
          res.status(501).send({
            status: "fail",
            msg: "user authorization error"
          });
          callback("Data is null or connection error3" + err, null);
        } else callback(null, owner_id, pushList, notiBox, connection);
      });
    },
    (owner_id, pushList, notiBox, connection, callback) => {
      let rmReservationQuery = 'delete from reservation where user_id = ? and owner_id = ?';
      connection.query(rmReservationQuery, [notiBox[0].user_id, owner_id], (err) => {
        if (err) {
          res.status(500).send({
            status: 'fail',
            msg: 'fail'
          });
          connection.release();
          callback("Data is null or connection error2" + err, null);
        } else {
          callback(null, owner_id, connection);
        }
      });
    },
    (owner_id, connection, callback) => {
      let rmCountQuery = 'update owners set owner_reservationCount = owner_reservationCount-1 where owner_id = ?';
      connection.query(rmCountQuery, owner_id, (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "remove reservationcount data error"
          });
          connection.release();
          callback("insert reservation data err : " + err, null);
        } else {
          res.status(200).send({
            status: "success",
            msg: "customer list get success"
          });
          connection.release();
          callback(null, "succesful remove reservation");
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