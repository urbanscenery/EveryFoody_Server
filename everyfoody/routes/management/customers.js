const async = require('async');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const pool = require('../../config/db_pool')
var express = require('express');
var router = express.Router();

router.get('/lists',function(req,res) {

	let taskArray = [
		function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) callback("DB connection error :"+err,null);
				else callback(null, connection)
			});
		},
		function(connection, callback){
      		let token = req.headers.token;
      		jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded){
		        if(err){
		          res.status(501).send({
		            msg : "501 user authorization error"
		          });
		          connection.release();
		          callback("JWT decoded err : "+ err, null);
		        }
        		else{        
        		 	callback(null, decoded.userID, connection);
        		}
      		});
      	},
      	function(owner_id,connection,callback)
      	{
      		let customerlistQuery = 'select u.user_nickname, u.user_phone ,r.reservation_time, u.user_id from users u inner join reservation r on u.user_id = r.user_id where r.owner_id = 14 order by reservation_time desc';
      		connection.query(customerlistQuery, owner_id, function(err, lists) {
      			if(err) {
      				callback("Data is null or connection error"+err,null);
      				connection.release();
      			}
      			else {
      				console.log(lists.user_nickname);
      				let user = lists;
      					
      				res.status(200).send({
						msg : "customer list get success",
						data : [{
							users : user
						}]
					})
					connection.release();
					callback(null,"customer list get success");
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

router.delete('/lists/remove/:user_id', function(req,res) {

	var user_id = req.params.user_id;

	let taskArray = [
		function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) callback("DB connection error :"+err,null);
				else callback(null, connection)
			});
		},
		function(connection, callback){
      		let token = req.headers.token;
      		jwt.verify(token, req.app.get('jwt-secret'), function(err, decoded){
		        if(err){
		          res.status(501).send({
		            msg : "501 user authorization error"
		          });
		          connection.release();
		          callback("JWT decoded err : "+ err, null);
		        }
        		else{        
        		 	callback(null, decoded.userID, connection);
        		}
      		});
      	},
      	function(owner_id,connection,callback)
      	{
      		let rmReservationQuery = 'delete from reservation where user_id = ? and owner_id = ?';
      		connection.query(rmReservationQuery,[user_id, owner_id], function(err, lists) {
      			if(err) {
      				callback("Data is null or connection error"+err,null);
      				connection.release();
      			}
      			else {
      				res.status(200).send({
						msg : "reservation remove success",		
					})
					connection.release();
					callback(null, "reservation remove success");
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
	})
})
module.exports = router;