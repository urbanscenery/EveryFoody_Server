var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/registration/:store_name', function(req, res, next) {
  
	var store_name = req.params.store_name
	var authURL = 

  	res.status(200).send({
	  		msg : "success",
			data : ""	
		}
	});
});

router.get('/location/:store_name', function(req, res, next) {
  
	var opentruck_latitude = req.body.opentruck_latitude;
	var opentruck_longitude = req.body.opentruck_longitude;
	var opentruck = req.body.store_name;
	var owner_email = req.body.owner_email;

  	res.status(200).send({
	  		msg : "success",
			data : ""	
		}
	});
});