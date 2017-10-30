const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const upload = require('../../modules/AWS-S3');
const express = require('express');
const router = express.Router();


router.get('/lists', (req, res, next) => {
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
          res.status(200).send({
            status: 'success',
            data: {
              menuinfo: menuinfo2
            },
            msg: 'menu list success'
          });
          connection.release();
          callback(null, "menu list success");
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

//메뉴정보 삭제
router.delete('/remove/:menu_id', (req, res, next) => {

  let menu_id = req.params.menu_id;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
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
      let menuRemoveQuery = 'delete from menu where owner_id = ? and menu_id = ?';
      connection.query(menuRemoveQuery, [owner_id, menu_id], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "remove menu error"
          });
          connection.release();
          callback("remove error :" + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "remove menu success"
          });
          connection.release();
          callback(null, "remove success");
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

//메뉴 정보 추가
router.put('/addition', upload.single('image'), (req, res, next) => {

  let menu_name = req.body.menu_name;
  let menu_price = req.body.menu_price;
  let menu_imageURL = req.file.location;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
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
      let menuAddQuery = 'insert into menu(owner_id, menu_name, menu_price, menu_imageURL) values(?,?,?,?)';
      connection.query(menuAddQuery, [owner_id, menu_name, menu_price, menu_imageURL], (err) => {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "addition menu error"
          });
          connection.release();
          callback("insert error :" + err, null);
        } else {
          res.status(201).send({
            status: "success",
            msg: "addition menu info success"
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

//메뉴 정보 수정
router.put('/modification/:menu_id', upload.single('image'), (req, res, next) => {

  let menu_name = req.body.menu_name;
  let menu_price = req.body.menu_price;
  let menu_imageURL = req.file.location;
  let menu_id = req.params.menu_id;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
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

      let menuUpdate = {
        menu_name: menu_name,
        menu_price: menu_price,
        menu_imageURL: menu_imageURL,
        menu_id: menu_id,
        owner_id: owner_id
      }
      let menumodifyQuery = 'update menu set menu_name = ?, menu_price = ?, menu_imageURL = ? where menu_id = ? and owner_id = ?';
      connection.query(menumodifyQuery, [menuUpdate.menu_name, menuUpdate.menu_price, menuUpdate.imageURL, menuUpdate.menu_id, menuUpdate.owner_id], (err) => {
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
            msg: "menu info modify success"
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


router.post('/modification/:menu_id', (req, res, next) => {

  let menu_name = req.body.menu_name;
  let menu_price = req.body.menu_price;
  let menu_imageURL = req.body.image;
  let menu_id = req.params.menu_id;

  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
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
      let menuUpdate = {
        menu_name: menu_name,
        menu_price: menu_price,
        menu_imageURL: menu_imageURL,
        menu_id: menu_id,
        owner_id: owner_id
      }
      let menumodifyQuery = 'update menu set menu_name = ?, menu_price = ?, menu_imageURL = ? where menu_id = ? and owner_id = ?';
      connection.query(menumodifyQuery, [menuUpdate.menu_name, menuUpdate.menu_price, menuUpdate.menu_imageURL, menuUpdate.menu_id, menuUpdate.owner_id], (err) => {
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
            msg: "menu info modify success"
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