var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/basic/:storeID', function(req, res) {

  var storeID = req.params.storeID;

  res.status(200).send({
    status: "success",
    data: {
      storeInfo: {
        storeID : 7,
        storeName : "동수네",
        storeImageURL : "imageURL",
        facebookURL : "facebookURL",
        twitterURL : "twitterURL",
        instagramURL : "instagram URL",
        opentime: "12:00 ~ 18:00",
        breaktime: "15:00 ~ 16:00",
        phone: "010-1111-1111",
        hashtag: "#이동수#존잘#개멋#존멋",
        bookmarked : 0,
        reservationCount : 5
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
    },
    msg : "successful loading basic store information"
  });
});

router.get('/menu/:storeID', function(req, res) {

  var storeID = req.params.storeID;

  res.status(200).send({
    status: "success",
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
    },
    msg : "successful loading menu information"
  });
});

module.exports = router;