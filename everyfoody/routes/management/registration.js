const mysql = require('mysql');
const acync = require('async');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../config/db_pool')
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


router.get('/registration/:store_name',uploade.single('image') function(req, res, next) {
  
	var store_name = req.params.store_name;
	var authURL = req.file.location;
	let taskArray = [
		function(callback){
			pool.getConnection(function(err, connection) {
				if(err) callback("DB connection error :"+err,null);
				else callback(null, connection)
			});
		},
		function(connection, callback) {
			let setOwnerQuery = 'UPDATE owner SET owner_storename = ?, owner_authURL= ? where owner_email = ?';
			connection.query(setOwnerQuery, [store_name, authURL, owner_email], function(err) {
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

	async.waterfall(task_array, function(err, result) {
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

router.get('/location/:store_name', function(req, res, next) {
  
  	var owner_email = req.body.owner_email;
	var opentruck_latitude = req.body.opentruck_latitude;
	var opentruck_longitude = req.body.opentruck_longitude;
	var opentruck = req.body.store_name;
	
	let tastArray =[
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
		function(conneciton,callback) {
			let setLocationQuery = 'INSERT INTO opentruck VALUES(?,?,?,?)';
			connection.query(setLocationQuery, [owner_email,opentruck_latitude,opentruck_longitude,opentruck], function(err) {
				if(err) {
					res.status(500).send({
						msg : "truck opening error"
					})
					connection.release();
					callback(null,"insert opening error");
				}
				else {
					res.status(200).send({
						msg : "truck opening success"
					})
					connection.release();
					callback(null,"insert opening success");
				}
			})			
		}
	];
	async.waterfall(task_array, function(err, result) {
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