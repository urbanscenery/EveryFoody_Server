const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const upload = require('../../modules/AWS-S3');
const express = require('express');
const router = express.Router();

// 정보 수정 처음 들어왔을 때
router.get('/basicinfo', (req, res) => {

  let taskArray = [
    // 1. connection setting
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("getConneciton error : " + err, null);
        else callback(null, connection);
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    (owner_id, connection, callback) => {
      let selectQuery = 'select * from owners o inner join users u on u.user_id = o.owner_id where o.owner_id =?';
      connection.query(selectQuery, owner_id, (err, basicinfo) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
        } else {
          let infomation = {
            storeName: basicinfo[0].owner_storename,
            storeImage: basicinfo[0].owner_detailURL,
            storeFacebookURL: basicinfo[0].owner_facebookURL,
            storeTwitterURL: basicinfo[0].owner_twitterURL,
            storeInstagramURL: basicinfo[0].owner_instagramURL,
            storeHashtag: basicinfo[0].owner_hashtag,
            storeOpentime: basicinfo[0].owner_opentime,
            storeBreaktime: basicinfo[0].owner_breaktime,
            storePhone: basicinfo[0].user_phone
          }
          callback(null, owner_id, infomation, connection);
        }
      });
    },
    (owner_id, basicInfo, connection, callback) => {
      let modifyQuery = 'select menu_id, menu_name, menu_price, menu_imageURL from menu where owner_id = ?';
      connection.query(modifyQuery, [owner_id], (err, menuinfo) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
          connection.release();
          callback(null, "menu list error");
        } else {
          let menuinfo2 = [];
          for (let i = 0; i < menuinfo.length; i++) {
            menuinfo2.push({
              menuID: menuinfo[i].menu_id,
              menuTitle: menuinfo[i].menu_name,
              menuPrice: menuinfo[i].menu_price,
              menuImageURL: menuinfo[i].menu_imageURL
            });
          }
          connection.release();
          callback(null, basicInfo, menuinfo2);
        }
      });
    },
    (basicInfo, menuInfo2, callback) => {
      res.status(200).send({
        status: 'success',
        data: {
          basicInfo: basicInfo,
          menuInfo: menuInfo2
        },
        msg: 'menu list success'
      });
      callback(null, "owner info success");
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


router.get('/basicinfo/modi', (req, res) => {

  let taskArray = [
    // 1. connection setting
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("getConneciton error : " + err, null);
        else callback(null, connection);
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    (owner_id, connection, callback) => {
      let selectQuery = 'select * from owners o inner join users u on u.user_id = o.owner_id where o.owner_id =?';
      connection.query(selectQuery, owner_id, (err, basicinfo) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
          connection.release();
          callback("select query error : " + err, null);
        } else {
          let infomation = {
            storeName: basicinfo[0].owner_storename,
            storeImage: basicinfo[0].owner_detailURL,
            storeFacebookURL: basicinfo[0].owner_facebookURL,
            storeTwitterURL: basicinfo[0].owner_twitterURL,
            storeInstagramURL: basicinfo[0].owner_instagramURL,
            storeHashtag: basicinfo[0].owner_hashtag,
            storeOpentime: basicinfo[0].owner_opentime,
            storeBreaktime: basicinfo[0].owner_breaktime,
            storePhone: basicinfo[0].user_phone
          }
          connection.release();
          callback(null, infomation);
        }
      });
    },
    (basicInfo, callback) => {
      res.status(200).send({
        status: 'success',
        data: {
          basicInfo: basicInfo
        },
        msg: 'menu list success'
      });
      callback(null, "owner info success");
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

//기본정보 수정시
router.post('/basicmodi', (req, res) => {

  let owner_breaktime = req.body.storeBreaktime;
  let owner_phone = req.body.storePhone;
  let owner_hashtag = req.body.storeHashtag;
  let owner_facebookURL = req.body.storeFacebookURL;
  let owner_twitterURL = req.body.storeTwitterURL;
  let owner_instagramURL = req.body.storeInstagramURL;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("getConneciton error : " + err, null);
        else callback(null, connection);
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    (owner_id, connection, callback) => {
      let setStoreinfoQuery = 'update owners as o inner join users as u on o.owner_id = u.user_id set o.owner_breaktime = ?, u.user_phone = ?,' +
        'o.owner_hashtag =?, o.owner_facebookURL = ?, o.owner_twitterURL =?, o.owner_instagramURL = ? where o.owner_id = ?';
      connection.query(setStoreinfoQuery, [owner_breaktime, owner_phone, owner_hashtag, owner_facebookURL, owner_twitterURL, owner_instagramURL, owner_id], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "owner info update error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "store info modify success"
          });
          connection.release();
          callback(null, "modify success");
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

router.put('/imagemodi', upload.any(), (req, res) => {
  let owner_detailURL = req.files[1].location;
  let owner_mainURL = req.files[0].location;
  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) callback("getConneciton error : " + err, null);
        else callback(null, connection);
      });
    },
    (connection, callback) => {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    (owner_id, connection, callback) => {
      let setStoreinfoQuery = 'update owners as o inner join users as u on o.owner_id = u.user_id set ' +
        'owner_detailURL = ?, owner_mainURL = ? where owner_id = ?';
      connection.query(setStoreinfoQuery, [owner_detailURL, owner_mainURL, owner_id], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "owner info update error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "store info modify success"
          });
          connection.release();
          callback(null, "modify success");
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