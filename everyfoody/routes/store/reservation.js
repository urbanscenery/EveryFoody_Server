var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/list', function(req, res, next) {

  var store_name = req.params.store_name;
  var owner_email = req.body.owner_email;

  res.status(200).send({
    msg: "success",
    status: 200,
    data: {
      custominfo: [{
          user_nickname: "존잘동수ㅎ",
          user_phone: 2160,
          reservation_time: "2017/12/09 15:00"
        },
        {
          user_nickname: "존잘동수",
          user_phone: 2160,
          reservation_time: "2017/12/09 15:00"
        }
      ]

    }
  });
});

router.get('/registration/:storeID', function(req, res, next) {

  var storeID = req.params.storeID;
  var owner_email = req.body.owner_email;
  var reservation_phone = req.body.reservation_phone;

  res.status(200).send({
    msg: "success",
    status: 200,
    data: ""

  });
});

module.exports = router;