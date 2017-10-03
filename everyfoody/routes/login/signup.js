const express = require('express');
const async = require('async');
const router = express.Router();
const pool = require('../../config/db_pool');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const saltRounds = 10;

//이름 양식 확인
function chkName(str){
  var name = /^([가-힣]{2,4})$/;
  if (!name.test(str)){
    return false;
  }
  return true;
}

//사업자 등록번호 양식 확인
function chkTaxID(str){
  var TaxID = /^([0-9]{3})-([0-9]{2})-([0-9]{5})$/;
  if (!TaxID.test(str)){
    return false;
  }
  return true;
}

//이용자 회원가입
router.post('/customer', function(req, res){
  res.status(201).send({
    status : "success",
    msg : "successful customer signup"
  })
});

//사업자 회원가입
router.post('/owner', function(req, res){
  res.status(201).send({
    status : "success",
    msg : "successful owner signup"
  })
});

module.exports = router;