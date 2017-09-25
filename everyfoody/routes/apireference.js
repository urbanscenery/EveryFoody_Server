const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function(req,res){
	fs.readFile('./views/redoc.html', 'utf-8',function(err, result){
		res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(result);  
    res.end();  
	});
});

module.exports = router;