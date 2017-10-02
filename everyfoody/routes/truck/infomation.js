var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/basic/:store_name', function(req, res, next) {
  
	var store_name = req.params.store_name;
	var owner_email = req.body.owner_email;

  	res.status(200).send(
	  	{
	  		msg : "basic infomation success",
			data : {
				storeinfo :{
					owner_opentime : "12:00 ~ 18:00",
					owner_breaktime : "15:00 ~ 16:00",
					owner_phone : "010-1111-1111",
					owner_hashtag : "#이동수#존잘#개멋#존멋"

				},
			review : [{
				user_nickname : "이동수",
				review_content : "어우 핵맛있어",
				review_score : 5,
				review_imageURL : "ddd"
				},
				{
					user_nickname : "이동수",
					review_content : "어우 핵맛있어",
					review_score : 5,
					review_imageURL : "ddd"
				}]
			}
		});
});

router.get('/menu/:store_name', function(req, res, next) {
  
  	var store_name = req.params.store_name;
	var owner_email = req.body.owner_email;

  	res.status(200).send({
  		msg : "menu infomation success",
		data : {
			menuinfo :[{
				menu_imageURL : "dddd",
				menu_price : 5000,
				menu_name : "연어가지스테이크"
			},
			{
				menu_imageURL : "dddd",
				menu_price : 5000,
				menu_name : "문어숙회"
			}]
		}
	});
});

module.exports = router;
