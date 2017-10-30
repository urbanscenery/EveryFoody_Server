var Messegelist = ['주문차례 입니다. 트럭으로 와주세요.','대기인원이 1명 남았습니다.','대기인원이 5명 남았습니다.'];
const moment = require('moment');
exports.sendMessege = function(length, messegeBox, pushList ) {
  if (length >= 1) {
      messegeBox.push({
        messege: {
        to: pushList[0].user_deviceToken,
        collapse_key: 'Owner',
        data: {           
          title: pushList[0].owner_storename,
          body: pushList[0].user_nickname+'님! '+Messegelist[0]
        }
      }
    });
  }
  if (length >=2) {
      messegeBox.push({
        messege: {
        to: pushList[1].user_deviceToken,
        collapse_key: 'Owner',
        data: {
          title: pushList[0].owner_storename,
          body: pushList[1].user_nickname+'님! '+Messegelist[1]
        }
      }
    });
  }
  if (length >= 6) {
      messegeBox.push({
      messege: {
        to: pushList[5].user_deviceToken,
        collapse_key: 'Owner',
        data: {
          title: pushList[0].owner_storename,
          body: pushList[1].user_nickname+'님! '+Messegelist[2]
        }
      }
    });
  }
  return messegeBox;
}

exports.saveMessege = (notiInfo, pushList) => {
  var notiInfo = []
  var length = pushList.length;
  if (length >= 1) {
     notiInfo.push({
      user_id : pushList[0].user_id,
      notice_content : "예약하신 ''"+pushList[0].owner_storename+"'' 의 \n"+Messegelist[0],
      notice_time : moment().format('YYYYMMDDHHmmss')
    });
  }
  if (length >= 2) {
    notiInfo.push({
      user_id : pushList[1].user_id,
      notice_content : "예약하신 ''"+pushList[0].owner_storename+"'' 의 \n"+Messegelist[1],
      notice_time : moment().format('YYYYMMDDHHmmss')
    });
  }
  if (length >= 6) {
    notiInfo.push({
      user_id : pushList[5].user_id,
      notice_content : "예약하신 <"+pushList[0].owner_storename+"> 의 \n"+Messegelist[5],
      notice_time : moment().format('YYYYMMDDHHmmss')
    });
  }
  return notiInfo;
}

