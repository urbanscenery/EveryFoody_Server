const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const notifunc = require('./notisave');
var express = require('express');
const moment = require('moment');
var router = express.Router();
var fcm = require('../../config/fcm_config');

router.get('/lists', function(req, res) {

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    function(connection, callback) {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
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
    function(owner_id, connection, callback) {
      let customerlistQuery = 'select u.user_nickname, u.user_phone ,r.reservation_time, u.user_id from users u inner join reservation r on u.user_id = r.user_id where r.owner_id = ? order by reservation_time desc';
      connection.query(customerlistQuery, owner_id, function(err, lists) {
        if (err) {
          callback("Data is null or connection error" + err, null);
          connection.release();
        } else {
          let user = lists;
          res.status(200).send({
            status: "success",
            data: user,
            msg: "customer list get success"
          })
          connection.release();
          callback(null, "customer list get success");
        }
      })
    }
  ];
  async.waterfall(taskArray, function(err, result) {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss// ') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss// ') + result;
      console.log(result);
    }
  });
});

router.delete('/lists/remove/:user_id', function(req, res) {

  var user_id = req.params.user_id;
  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) callback("DB connection error :" + err, null);
        else callback(null, connection)
      });
    },
    function(connection, callback) {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
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
    function(owner_id, connection, callback) {
      let customerlistQuery = 'select o.owner_storename, u.user_deviceToken, r.reservation_time, u.user_id from users u '
      +'inner join reservation r inner join owners o '
      +'on u.user_id = r.user_id and r.owner_id = o.owner_id where r.owner_id = 14 order by reservation_time desc';
      connection.query(customerlistQuery, owner_id, function(err, pushList) {
        if (err) {
          callback("Data is null or connection error" + err, null);
          connection.release();
        }
        else {
          let length = pushlist.length;
          let messageBox = []
          messageBox = notifunc.sendMessage(length, messageBox);
          fcm.send(messageBox, function(err, response) {
            if (err) {
              console.log("Something has gone wrong!" + err);
              callback("Message send error" + err, null);
            }
            else {
              console.log("Successfully sent with response: ", response);
              callback(null, owner_id, pushList.user_id, connection);
            }
          });
        }
      });
    },
    function(owner_id, pushUserID, connection,callback) {
      let notiSaveQuery = 'insert into notice value(?,?,?)';
      var notiInfo = [];
      notiInfo = notifunc.saveMessage(notiInfo,pushUserID);
      for(int i=0; i<notiInfo.length; ++i) {
        connection.query(notiSaveQuery,notiInfo[i],function(err){
          if(err){
            connection.release();
            callback("Data is null or connection error" + err, null);
          }
        });
      }
      callback(null, owner_id, connection);
    },
    function(owner_id, connection, callback) {
      let rmReservationQuery = 'delete from reservation where user_id = ? and owner_id = ?';
      connection.query(rmReservationQuery, [user_id, owner_id], function(err, lists) {
        if (err) {
          connection.release();
          callback("Data is null or connection error" + err, null);
        } else {
          res.status(200).send({
            status: "success",
            msg: "reservation remove success"
          })
          connection.release();
        }
      })
    }
  ]
  async.waterfall(taskArray, function(err, result) {
    if (err) {
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    } else {
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  })
})
module.exports = router;