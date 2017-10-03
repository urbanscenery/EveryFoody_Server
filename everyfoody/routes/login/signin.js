const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const saltRounds = 10;

//로그인 더미데이터
router.post('/', function(req, res){
	
	res.status(201).send({
		status : "success",
		data : {
			token : "ThisIsDummyData",
			name : "김연태",
			category : 1
		},
		msg : "successful customer facebook login" 
	})
});


module.exports = router;