var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/basic/:storeID', function(req, res) {

  var store_name = req.params.storeID;
  var owner_email = req.body.owner_email;

  res.status(200).send({
    msg: "basic infomation success",
    data: {
      storeinfo: {
        opentime: "12:00 ~ 18:00",
        breaktime: "15:00 ~ 16:00",
        phone: "010-1111-1111",
        hashtag: "#이동수#존잘#개멋#존멋"

      },
      review: [{
          nickname: "이동수",
          content: "어우 핵맛있어",
          score: 6,
          imageURL: "ddd"
        },
        {
          nickname: "이동수",
          content: "어우 핵맛있어",
          score: 7,
          imageURL: "ddd"
        }
      ]
    }
  });
});

router.get('/menu/:storeID', function(req, res) {

  var store_name = req.params.storeID;
  var owner_email = req.body.owner_email;

  res.status(200).send({
    msg: "menu infomation success",
    data: {
      menuinfo: [{
          imageURL: "dddd",
          price: 5000,
          title: "연어가지스테이크"
        },
        {
          imageURL: "dddd",
          price: 5000,
          title: "문어숙회"
        }
      ]
    }
  });
});

module.exports = router;