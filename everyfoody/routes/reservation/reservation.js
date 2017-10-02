var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/list', function(req, res, next) {
  
	var user_email = req.body.user_email;
	var owner_email = req.body.owner_email;
	var review_score = req.body.review_score;
	var review_content = req.body.review_content;
	var store_name = req.params.store_name;

  	res.status(200).send(
	  	{
	  		msg : "success",
			status : 200,
			data : ""
		}
	});
});