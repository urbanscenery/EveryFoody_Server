const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool');
const upload = require('../../modules/AWS-S3');
var express = require('express');
var router = express.Router();


// 정보 수정 처음 들어왔을 때
router.get('/modification', function(req, res, next) {

  let taskArray = [
    // 1. connection setting
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) callback("getConneciton error : " + err, null);
        else callback(null, connection);
      })
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
      })
    },
    function(owner_id, connection, callback) {
      let selectQuery = 'select * from owners o inner join users u on u.user_id = o.owner_id where o.owner_id =?';
      connection.query(selectQuery, owner_id, function(err, basicinfo) {
        if (err) {
          res.status(500).send({
            status: "fail",
            msg: "query error"
          });
        } else {
          let infomation = {              
                storeName : basicinfo[0].owner_storename,
                storeImage : basicinfo[0].owner_detailURL,
                storeFacebookURL : basicinfo[0].owner_facebookURL,
                storeTwitterURL : basicinfo[0].owner_twitterURL,
                storeInstagramURL : basicinfo[0].owner_instagramURL,
                storeHashtag : basicinfo[0].owner_hashtag,
                storeOpentime : basicinfo[0].owner_opentime,
                storeBreaktime : basicinfo[0].owner_breaktime,      
                storePhone : basicinfo[0].user_phone                                                        
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
            status: "fail",
            msg: "query error"
          });
        }
        else {
          let menuinfo2= [];
          for(var i=0; i<menuinfo.length; i++)
          {              
           menuinfo2.push({
            menuID : menuinfo[i].menu_id,
            menuTitle : menuinfo[i].menu_name,
            menuPrice : menuinfo[i].menu_price,
            menuImageURL : menuinfo[i].menu_imageURL
            })
          }        
          callback(null, basicinfo, menuinfo2, connection);
        }
      })
    },
    function(basicinfo, menuinfo, connection) {
      res.status(200).send({
        status: "success",
        data: {
          basicInfo: basicinfo,
          menuInfo : menuinfo
        },
        msg: "basic & menuinfo success"
      })
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

//기본정보 수정시
router.post('/basic/modification',upload.single('storeImage'),function(req, res, next) {
  
  var owner_storename = req.body.storeName;
  var owner_breaktime = req.body.storeBreaktime;
  var owner_phone = req.body.storePhone;
  var owner_hashtag = req.body.storeHashtag;
  var owner_facebookURL = req.body.storeFacebookURL;
  var owner_twitterURL = req.body.storeTwitterURL;
  var owner_instagramURL = req.body.storeInstagramURL;
  var owner_detailURL = req.file.location;
  var owner_mainURL = req.file.location;

  let taskArray = [
    function(callabck) {
      pool.Connection(function(err, connection) {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
        else callback(null, connection);
      })
    },
    function(connection, callback) {
      let token = req.headers.token;
      jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded) {
        if (err) {
          res.status(501).send({
            status : "fail",
            msg: "user authorication error"
          });
          connection.release();
          callback("JWT decoded err : " + err, null);
        } else callback(null, decoded.owner_id, connection);
      })
    },
    function(owner_id, connection, callback) {
      let setStoreinfoQuery = 'update owners set owner_storename = ? , owner_breaktime = ?, owner_phone = ?,'
      +'owner_hashtag =?, owner_facebookURL = ?, owner_twitterURL =?, owner_instagramURL = ?, owner_detailURL = ?, owner_mainURL = ? where owner_id = ?';
      connection.query(setSotreinfoQuery,[owner_storename, owner_breaktime, owner_phone,owner_hashtag, owner_facebookURL,owner_twitterURL,owner_instagramURL,owner_detailURL,owner_mainURL, owner_id],function(err){
        if(err) {
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
  });
});

//메뉴정보 삭제
router.delete('/menu/remove/:menu_id', function(req, res, next) {

  var menu_id = req.params.menu_id;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
        else callback(null, connection);
      })
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
      })
    },
    function(owner_id, connection, callback) {
      console.log('owner_id'+owner_id +' menu_id'+menu_id);
      let menuRemoveQuery = 'delete from menu where owner_id = ? and menu_id = ?';
      connection.query(menuRemoveQuery, [owner_id, menu_id], function(err) {
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
  });
});

//메뉴 정보 추가
router.put('/menu/addition',upload.single('image'), function(req, res, next) {

  var menu_name = req.body.menu_name;
  var menu_price = req.body.menu_price;
  var menu_imageURL = req.file.location;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
        else callback(null, connection);
      })
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
      })
    },
    function(owner_id, connection, callback) {
      console.log(owner_id +" owner_id");
      let menuAddQuery = 'insert into menu(owner_id, menu_name, menu_price, menu_imageURL) values(?,?,?,?)';
      connection.query(menuAddQuery, [owner_id, menu_name, menu_price, menu_imageURL], function(err) {
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
  });
});

//메뉴 정보 수정
router.put('/menu/modification/:menu_id',upload.single('image'), function(req, res, next) {

  var menu_name = req.body.menu_name;
  var menu_price = req.body.menu_price;
  var menu_imageURL = req.file.location;
  var menu_id = req.params.menu_id;

  let taskArray = [
    function(callback) {
      pool.getConnection(function(err, connection) {
        if (err) res.status(500).send({
          status: "fail",
          msg: "connection error"
        });
        else callback(null, connection);
      })
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
      })
    },
    function(owner_id, connection, callback) {

      let menumodifyQuery = 'update menu set menu_name = ?, menu_price = ?, menu_imageURL = ? where menu_id = ? and owner_id = ?';
      connection.query(menumodifyQuery, [menu_name, menu_price, menu_imageURL, menu_id, owner_id], function(err) {
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
  });
});

module.exports = router;