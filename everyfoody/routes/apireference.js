const express = require('express');
const router = express.Router();
const fs = require('fs');
var path = require('path');

var redoc = path.join(__dirname, '../views/redoc.html');

router.get('/', function(req,res){
	fs.readFile(redoc, 'utf-8',function(err, result){
		if(err){
			console.log(err);
			res.write("Connection Error");
			res.end();
		}
		else{
			res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(result);  
    res.end(); 
  	}
	});
});

module.exports = router;