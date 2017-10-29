const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const upload = require('../../modules/AWS-S3');
const fcm = require('../../config/fcm_config');


router.post('/store', upload.single('image'), function(req, res, next) {

  let authURL = req.file.location;
  let store_name = req.body.store_name;

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
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.userID, connection);
      });
    },
    function(owner_id, connection, callback) {
      let setOwnerQuery = 'insert into owners (owner_id, owner_storename, owner_authURL) values (?, ?, ?)';
      connection.query(setOwnerQuery, [owner_id, store_name, authURL], function(err) {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "ownerinfo update error"
          });
          connection.release();
          callback("update info error :" + err, null);
        } else callback(null, owner_id, connection);
      });
    },
    function(owner_id, connection, callback) {
      let changeCategoryQuery = "UPDATE users set user_status = ? where user_id = ?";
      connection.query(changeCategoryQuery, [403, owner_id], function(err) {
        if (err) {
          res.status(501).send({
            status: "fail",
            msg: "update query error"
          });
          connection.release();
          callback("update query error : " + err, null);
        } else {
          res.status(200).send({
            status: "success",
            msg: "Success"
          });
          connection.release();
          callback(null, "successful update user category");
        }
      });
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
});

router.put('/closing', function(req, res, next) {

  let opentruck_latitude = -1;
  let opentruck_longitude = -1;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            status: "failt",
            msg: "connection error"
          });
        } else callback(null, connection);
      });
    },
    function(connection, callback) {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
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
    function(owner_id, connection, callback) {
      let setLocationQuery = 'UPDATE owners SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
      connection.query(setLocationQuery, [opentruck_latitude, opentruck_longitude, owner_id], function(err) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "truck opening error"
          })
          connection.release();
          callback(null, "remove opening truck error" + err);
        } else {
          res.status(200).send({
            status: "success",
            msg: "truck opening success"
          });
          connection.release();
          callback(null, "remove opening  truck success" + err);
        }
      });
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
});

router.put('/opening', function(req, res, next) {

  let opentruck_latitude = req.body.opentruck_latitude;
  let opentruck_longitude = req.body.opentruck_longitude;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "connection error"
          });
        } else callback(null, connection);
      });
    },
    function(connection, callback) {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
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
    function(owner_id, connection, callback) {
      let setLocationQuery = 'UPDATE owners SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
      connection.query(setLocationQuery, [opentruck_latitude, opentruck_longitude, owner_id], function(err) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "truck opening error"
          });
          connection.release();
          callback(null, "insert opening truck error" + err);
        } else {
          res.status(200).send({
            status: "success",
            msg: "truck opening success"
          });
          connection.release();
          callback(null, "insert opening truck success" + err);
        }
      });
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
});

module.exports = router;