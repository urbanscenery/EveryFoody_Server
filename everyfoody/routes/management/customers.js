const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
var notifunc = require('../../modules/notisave.js');
var fcm = require('../../config/fcm_config');
var express = require('express');
var router = express.Router();


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

router.delete('/lists/remove', function(req, res) {
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
      +'on u.user_id = r.user_id and r.owner_id = o.owner_id where r.owner_id = 21 order by reservation_time desc';
      connection.query(customerlistQuery, function(err, pushList) {
        if (err) {
          callback("Data is null or connection error" + err, null);
          connection.release();
        }
        else {        
          let messageBox = []
          let notiBox = []
          let length = pushList.length;
          messageBox = notifunc.sendMessage(length, messageBox, pushList);
          notiBox = notifunc.saveMessage(notiBox, pushList)         
          for(var i =0; i< messageBox.length; ++i)
          {                      
            fcm.send(messageBox[i].message, function(err, response) {
              if (err) {
                console.log("Something has gone wrong!" + err);
                callback("Message send error" + err, null);                
              }
              else {
                console.log("Successfully sent with response: ", response);              
              }
            });
          } 
          callback(null, owner_id, pushList, notiBox, connection);       
        }
      });
    },
    function(owner_id, pushList, connection,callback) {
      let notiSaveQuery = 'insert into notice value(?,?,?)';
      var notiInfo = [];
      notiInfo = notifunc.saveMessage(notiInfo,pushUserID);
      for(var i=0; i<notiInfo.length; ++i) {
        connection.query(notiSaveQuery,notiInfo[i],function(err){
          if(err){
            connection.release();
            callback("Data is null or connection error" + err, null);
          }
        });
      }
      callback(null, owner_id, pushList, notiBox, connection);
    },
    function(owner_id, pushList, notiBox, connection, callback) {      
      let rmReservationQuery = 'delete from reservation where user_id = ? and owner_id = ?';
      connection.query(rmReservationQuery, [pushList[0].user_id, owner_id], function(err, lists) {
        if (err) {
          connection.release();
          callback("Data is null or connection error" + err, null);
        }
        else {
          callback(null, owner_id, pushlist, connection);
        }
      })
    },
    (userID, connection, notiBox, callback) => {
      let addnoticeQuery;
      addnoticeQuery = 'insert into notice values(? ,? ,?)';    
      connection.query(addnoticeQuery, notibox, function(err){
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "addition noticeData data error"
          });
          connection.release();
          callback("get reservation data err : " + err, null);
        } else{
          res.status(200).send({
            status: 'success',
            msg : "addition noticeData"
          })      
          callback(null, "Successful caddition noticeData");
        }
      });
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