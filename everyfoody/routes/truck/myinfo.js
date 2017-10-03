var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/modification/:store_name', function(req, res, next) {
  
	var store_name = req.params.store_name;
	var owner_email = req.body.owner_email;

  	res.status(200).send(
	  	{
	  		msg : "success",
			status : 200,
		}
	});
});
router.get('/compelete/:store_name', function(req, res, next) {
  
	var store_name = req.params.store_name;
	var owner_email;
	var owner_storename;
	var owner_breaktime;
	var owner_phone;
	var owner_hashtag;
	var owner_facebookURL;
	var owner_twitterURL;
	var owner_instagramURL;
	var owner_imageURL;
	var menu_name = [];
	var menu_price = [];

  	res.status(200).send(
	  	{
	  		msg : " infomation modifiy is success",
			data :""
			}
		});
});
router.get('/remove/:store_name', function(req, res, next) {
  
	var store_name = req.params.store_name;
	var owner_email = req.body.owner_email;

  	res.status(200).send(
	  	{
	  		msg : "menu remove success",
			data : ""
		}
	});
});
