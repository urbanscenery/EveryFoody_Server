const express = require('express');
const router = express.Router();
const async = require('async');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool')
const upload = require('../../modules/AWS-S3');


router.put('/store', upload.single('image'), function(req, res, next) {

	var authURL = req.file.location;
	var store_name = req.body.store_name;
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
	            status : "fail",
	            msg : "user authorication error"
	          });
	          connection.release();
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
						status : "fail",
						msg : "ownerinfo update error"
					});
					connection.release();
					callback("update info error :"+ err,null);
				}
				else {
					res.status(200).send({
						status : "success",
						msg : "Success"
					});
					connection.release();
					callback(null, "Successful regist owner info");
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
						status : "failt",
						msg : "connection error"
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
	            status : "fail",
	            msg : "user authorication error"
	          });
	          connection.release();
	          callback("JWT decoded err : "+ err, null) ;
	        }
	        else callback(null, decoded.userID, connection);
	      })
    	},
		function(owner_id, connection, callback) {
			let setLocationQuery = 'UPDATE owner SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
			connection.query(setLocationQuery, [opentruck_latitude, opentruck_longitude, owner_id], function(err) {
				if(err) {
					res.status(500).send({
						status : "fail",
						msg : "truck opening error"
					})
					connection.release();
					callback(null,"remove opening truck error"+err);
				}
				else {
					res.status(200).send({
						status : "success",
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
});

router.put('/opening', function(req, res, next) {
  
	var opentruck_latitude = req.body.opentruck_latitude;
	var opentruck_longitude = req.body.opentruck_longitude;
	
	let taskArray =[
		function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) {
					res.status(500).send({
						status : "fail",
						msg : "connection error"
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
	            status : "fail",
	            msg : "user authorication error"
	          });
	          connection.release();
	          callback("JWT decoded err : "+ err, null) ;
	        }
	        else callback(null, decoded.userID, connection);
	      })
    	},
		function(owner_id, connection, callback) {
			let setLocationQuery = 'UPDATE owner SET owner_latitude = ?, owner_longitude = ? where owner_id = ?';
			connection.query(setLocationQuery, [opentruck_latitude, opentruck_longitude, owner_id], function(err) {
				if(err) {
					res.status(500).send({
						status : "fail",
						msg : "truck opening error"
					})
					connection.release();
					callback(null,"insert opening truck error"+err);
				}
				else {
					res.status(200).send({
						status : "success",
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
})

module.exports = router;


