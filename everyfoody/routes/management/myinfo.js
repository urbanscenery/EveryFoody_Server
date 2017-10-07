const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool')
var express = require('express');
var router = express.Router();


// 정보 수정 처음 들어왔을 때
router.get('/modification', function(req, res, next) {

  let taskArray = [
  // 1. connection setting
    function(callback) {
      pool.getConnection(function(err, connection) {
        if(err) callback("getConneciton error : "+ err, null);
        else callback(null, connection);
      })
    },
    function(connection, callback){
          let token = req.headers.token;
          jwt.verify(token, req.app.get('jwt-secret'),function(err, decoded){
            if(err){
              res.status(501).send({
                msg : "501 user authorication error",
                status : "fail"
              });
              connection.realease();
              callback("JWT decoded err : "+ err, null) ;
            }
            else callback(null, decoded.userID, connection);
          })
        },    
    function(owner_id, connection, callback) {
      let selectQuery = 'select * from owners where owner_id = ?';
      connection.query(selectQuery, owner_id, function(err, basicinfo) {
        if(err){
          res.status(500).send({
            msg : "query error",
            status : "fail"
          });
        }
        else {    
          let infomation = {
                owner_storename : basicinfo[0].owner_storename,
                owner_breaktime : basicinfo[0].owner_breaktime,
                owner_phone : basicinfo[0].owner_phone,
                owner_hashtag : basicinfo[0].owner_hashtag,
                owner_facebookURL : basicinfo[0].owner_facebookURL,
                owner_twitterURL : basicinfo[0].owner_twitterURL,
                owner_instagramURL : basicinfo[0].owner_instagramURL,
                owner_imageURL : basicinfo[0].owner_imageURL
              }
         callback(null, owner_id, infomation, connection);
        }
      })
    }, 
   function(owner_id, basicinfo, connection, callback) {
      let modifyQuery = 'select menu_id, menu_name, menu_price, menu_imageURL from menu where owner_id = ?';
      connection.query(modifyQuery, [owner_id],function(err, menuinfo) {
        if(err){
          res.status(500).send({
            msg : "query error",
            status : "fail"
          });
        }
        else {
         callback(null, basicinfo, menuinfo, connection);
        }
      })
    },
    function(basicinfo, menuinfo, connection) {
      res.status(200).send({
        msg : "basic & menuinfo success",
        status : "success"
        data : [{
          basicinfo : basicinfo,
          menuinfo : menuinfo
        }]
      })
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

//기본정보 수정시
router.post('/basic/modification', function(req, res, next) {

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


  let taskArray = [
    function(callabck) {
      pool.Connection(function(err, connection){
        if(err) res.status(500).send({
          msg : "500 connection error",
          status : "fail"
        });
        else callback(null,connection);
      })
    },
    function(connection, callback){
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
            msg : "owner info update error",
            status : "fail"
          });
          connection.release();
          callback("insert error :"+err, null);
        }
        else {
          res.status(201).send({
            msg : "store info modify success",
            status : "success"
          });
          connection.release();
          callback(null,"modify success");
        }
      })
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

//메뉴정보 수정
router.delete('/menu/remove/:menu_id', function(req, res, next) {

  var menu_id = req.body.menu_id;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection){
        if(err) res.status(500).send({
          msg : "500 connection error",
          status : "fail"
        });
        else callback(null,connection);
      })
    },
    function(connection, callback){
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'),function(err, decoded){
        if(err){
          res.status(501).send({
            msg : "501 user authorication error",
            status : "fail"
          });
          connection.realease();
          callback("JWT decoded err : "+ err, null) ;
        }
        else callback(null, decoded.userID, connection);
      })
    },
    function(owner_id,connection, callback) {
      let menuRemoveQuery = 'delete from menu where owner_id = ? and menu_id = ?';
      connection.query(menuRemoveQuery,[owner_id, menu_id],function(err){
        if(err) {
          res.status(500).send({
            msg : "remove menu error",
            status : "fail"
          });
          connection.release();
          callback("remove error :"+err, null);
        }
        else {
          res.status(201).send({
            msg : "remove menu success",
            status : "success"
          });
          connection.release();
          callback(null,"remove success");
        }
      })
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

router.put('/menu/addition', function(req, res, next) {

  var menu_name = req.body.menu_name;
  var menu_price = req.body.menu_price;
  var menu_imageURL = req.body.menu_imageURL;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection){
        if(err) res.status(500).send({
          msg : "500 connection error",
          status : "fail"
        });
        else callback(null, connection);
      })
    },
    function(connection, callback){
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'),function(err, decoded){
        if(err){
          res.status(501).send({
            msg : "501 user authorication error",
            status : "fail"
          });
          connection.realease();
          callback("JWT decoded err : "+ err, null) ;
        }
        else callback(null, decoded.userID, connection);
      })
    },
    function(owner_id,connection, callback) {
      
      let menuAddQuery = 'insert into menu values(?,?,?,?,?)';
      connection.query(menuAddQuery,[null, owner_id, menu_name, menu_price, menu_imageURL],function(err){
        if(err) {
          res.status(500).send({
            msg : "addition menu error",
            status : "fail"
          });
          connection.release();
          callback("insert error :"+err, null);
        }
        else {
          res.status(201).send({
            msg : "addition menu info success",
            status : "success"
          });
          connection.release();
          callback(null,"modify success");
        }
      })
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

router.put('/menu/modification/:menu_id', function(req, res, next) {

  var menu_name = req.body.menu_name;
  var menu_price = req.body.menu_price;
  var menu_imageURL = req.body.menu_imageURL;
  var menu_id = req.params.menu_id;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection){
        if(err) res.status(500).send({
          msg : "500 connection error",
          status : "fail"
        });
        else callback(null,connection);
      })
    },
    function(connection, callback){
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'),function(err, decoded){
        if(err){
          res.status(501).send({
            msg : "501 user authorication error",
            status : "fail"
          });
          connection.realease();
          callback("JWT decoded err : "+ err, null) ;
        }
        else callback(null, decoded.userID, connection);
      })
    },
    function(owner_id,connection, callback) {
      
      let menumodifyQuery = 'update menu set menu_name = ?, menu_price = ?, menu_imageURL = ? where menu_id = ? and owner_id = ?';
      connection.query(menumodifyQuery,[menu_name, menu_price, menu_imageURL, menu_id, owner_id], function(err) {
        if(err) {
          res.status(500).send({
            msg : "owner info update error",
            status : "fail"
          });
          connection.release();
          callback("insert error :"+err, null);
        }
        else {
          res.status(201).send({
            msg : "menu info modify success",
            status : "fail"
          });
          connection.release();
          callback(null,"modify success");
        }
      })
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

module.exports = router;