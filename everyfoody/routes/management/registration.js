const mysql = require('mysql');
const async = require('async');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const pool = require('../../config/db_pool')
var express = require('express');
var router = express.Router();

const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'befreshrecipes',
        acl: 'public-read',
        key: function(req, file, cb) {
            cb(null, Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
});


router.put('/store', upload.single('image'), function(req, res, next) {

	var authURL = req.file.location;
	let taskArray = [
		function(callback){
			pool.getConnection(function(err, connection) {
				if(err) callback("DB connection error :"+err,null);
				else callback(null, connection)
			});
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
	        else callback(null, decoded.userID, connection);
	      })
    	},
		function(owner_id, connection, callback) {
			let setOwnerQuery = 'insert into owner(owner_id, owner_storename, owner_authURL) values (?, ?, ?)';
			connection.query(setOwnerQuery, [owner_id, store_name, authURL], function(err) {
				if(err) {
					res.status(501).send({
						msg : "ownerinfo update error"
					});
					connection.release();
					callback("update info error :"+ err,null);
				}
				else {
					res.status(200).send({
						msg : "Success"
					});
					connection.release();
					callback(null, "Successful change password");
				}
			});
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

router.put('/closing', function(req, res, next) {
  
	var opentruck_latitude = -1;
	var opentruck_longitude = -1;
	
	let taskArray =[
		function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) {
					res.status(500).send({
						msg : "500 connection error"
					});
				}
				else callback(null, connection);
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
	        else callback(null, decoded.userID, connection);
	      })
    	},
		function(owner_id, connection, callback) {
			let setLocationQuery = 'UPDATE owner SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
			connection.query(setLocationQuery, [owner_latitude, owner_longitude, owner_id], function(err) {
				if(err) {
					res.status(500).send({
						msg : "truck opening error"
					})
					connection.release();
					callback(null,"remove opening truck error"+err);
				}
				else {
					res.status(200).send({
						msg : "truck opening success"
					})
					connection.release();
					callback(null,"remove opening  truck success"+err);
				}
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

  	router.put('/opening', function(req, res, next) {
  
	var opentruck_latitude = req.body.opentruck_latitude;
	var opentruck_longitude = req.body.opentruck_longitude;
	
	let taskArray =[
		function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) {
					res.status(500).send({
						msg : "500 connection error"
					});
				}
				else callback(null, connection);
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
	        else callback(null, decoded.userID, connection);
	      })
    	},
		function(owner_id, connection, callback) {
			let setLocationQuery = 'UPDATE owner SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
			connection.query(setLocationQuery, [owner_latitude, owner_longitude, owner_id], function(err) {
				if(err) {
					res.status(500).send({
						msg : "truck opening error"
					})
					connection.release();
					callback(null,"insert opening truck error"+err);
				}
				else {
					res.status(200).send({
						msg : "truck opening success"
					})
					connection.release();
					callback(null,"insert opening truck success"+err);
				}
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

module.exports = router;