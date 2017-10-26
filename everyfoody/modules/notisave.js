var Messegelist = ['음식받으러 오세요','현재 대기번호 1번 입니다.','현재 대기번호 5번 입니다.'];
const moment = require('moment');
exports.sendMessage = function(length, messegeBox,pushList ) {
  if (length >= 1) {
      messegeBox.push({
        messege: {
        to: pushList[0].user_deviceToken,
        collapse_key: 'Updates Available2',
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
        collapse_key: 'Updates Available3',
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
        collapse_key: 'Updates Available5',
        data: {
          title: pushList[0].owner_storename,
          body: pushList[1].user_nickname+'님! '+Messegelist[1]
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
      notice_content : Messagelist[0],
      notice_time : moment()
    });
  }
  if (length >= 2) {
    notiInfo.push({
      user_id : pushList[1].user_id,
      notice_content : Messegelist[1],
      notice_time : moment()
    });
  }
  if (length >= 6) {
    notiInfo.push({
      user_id : pushList[5].user_id,
      notice_content : Messegelist[2],
      notice_time : moment()
    });
  }
  return notiInfo;
}

