var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/region/:region_name', function(req, res, next) {
  
  	var region_name = req.params.region_name;
  	res.status(200).send({
	  		msg : "success",
			data :{
				store : {
					owner_storename:"dongsu",
					owner_imageURL : "ddd",	
					reservation_count : "3"
				}			 
			}
		}
	});
});