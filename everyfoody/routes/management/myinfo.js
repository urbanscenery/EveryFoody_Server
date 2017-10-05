const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool')
var express = require('express');
var router = express.Router();


/* GET users listing. */
router.post('/modification/:store_name', function(req, res, next) {

  console.log("access in modification")
  var store_name = req.params.store_name;
  var owner_email = req.body.owner_email;

  let taskArray = [
  // 1. connection setting
    function(callback) {
      pool.getConnection(function(err, connection) {
        if(err) callback("getConneciton error : "+ err, null);
        else callback(null, connection);
      })
    },
    // 2. store_name and owner_eamil ,select query
    function(connection,callback) {
      let modifyQuery = 'select * from owners where owner_storename = ? and owner_email = ?';
      connection.query(modifyQuery, [store_name,owner_email],function(err, store_data) {
        if(err){
          res.status(500).send({
            msg : "query error"
          });
        }
        else {
         callback(null,store_data);
        }
      })
    },
    function(store_data, callback) {
        res.status(200).send({
              msg: "success",
              data : {
                basicinfo : {
                owner_storename : "동수의푸드트럭",
                owner_breaktime : "15:00 ~ 16:30",
                owner_phone : "010-1111-1111",
                owner_hashtag : "#동수#존잘#존멋",
                owner_facebookURL : "",
                owner_twitterURL : "",
                owner_instagramURL : "",
                owner_imageURL : "",
              },
              menuinfo:[{
                menu_name : "올리브가지스테이크",
                menu_price : "3000",
                menu_imageURL : ""
              },
              {
                menu_name : "올리브가지스테이크",
                menu_price : "3000",
                menu_imageURL : ""
              }]
            }
          });
        connection.release();
        callback(null, "successful send data");
      }
  ];
  async.waterfall(taskArray, function(err, result) {
    if (err){
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    }
    else{
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  });
});

// 현재 회의 필요 -> 수정 부분 문제 많
router.get('/compelete/:store_name', function(req, res, next) {

  var store_name = req.params.store_name;
  var owner_email = req.body.owner_email;
  var owner_storename = req.body.owner_storename;
  var owner_breaktime = req.body.owner_breaktime;
  var owner_phone = req.body.owner_phone;
  var owner_hashtag = req.body.owner_hashtag;
  var owner_facebookURL = req.body.owner_facebookURL;
  var owner_twitterURL = req.body.owner_twitterURL;
  var owner_instagramURL = req.body.owner_instagramURL;
  var owner_imageURL = req.body.owner_imageURL;
  var menu_name = [];
  var menu_price = [];


  let taskArray = [
    function(callabck) {
      pool.Connection(function(err, connection){
        if(err) res.status(500).send({
          msg : "500 connection error"
        });
        else callback(null,connection);
      })
    },
    function(connction, callback){
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'),function(err, decoded){
        if(err){
          res.status(501).send({
            msg : "501 user authorication error"
          });
          connection.realease();
          callback("JWT decoded err : "+ err, null) ;
        }
        else callback(null, decoded.owner_email, connection);
      })
    },
    function(connection, callback) {
      let setStoreinfoQuery = 'update owner set owner_storename = ? , owner_breaktime = ?, owner_phone = ?,'
      +'owner_hashtag =?, owner_facebookURL = ?, owner_twitterURL =?, owner_instagramURL = ?, owner_imageURL = ? where owner_email = ?';
      connection.query(setSotreinfoQuery,[owner_storename, owner_breaktime, owner_phone,owner_hashtag, owner_facebookURL,owner_twitterURL,owner_instagramURL,owner_imageURL,owner_email],function(err){
        if(err) {
          res.status(500).send({
            msg : "owner info update error"
          });
          connection.release();
          callback("insert error :"+err, null);
        }
        else callback(null, connection);
      })
    },
    function(connection, callback) {
      // let setStoreMenuQuery = 'update menu set    '
    }
  ]
  async.waterfall(taskArray, function(err, result) {
    if (err){
      err = moment().format('MM/DDahh:mm:ss//') + err;
      console.log(err);
    }
    else{
      result = moment().format('MM/DDahh:mm:ss//') + result;
      console.log(result);
    }
  });
});
router.get('/remove/:store_name', function(req, res, next) {

  var store_name = req.params.store_name;
  var owner_email = req.body.owner_email;

  res.status(200).send({
    msg: "menu remove success",
    data: ""

  });
});

module.exports = router;