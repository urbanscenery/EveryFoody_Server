const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const saltRounds = 10;

//이용자 로그인
router.post('/signin', function(req, res){
	
	res.status(200).send({
		msg : "success",
		data : "" 
	})
});

router.post('/signup',function(req,res){

	res.status(200),send({
		msg : "signup success",
		data : ""
	})
});

module.exports = router;