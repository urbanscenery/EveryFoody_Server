var fcm = require('../../config/fcm_config');
var sendMessage = ['음식받으러 오세요', '현재 대기번호 1번 입니다.','','','','현재 대기번호 5번 입니다.'];
exports.sendMessage= (length, MessageBox ) =>
{
  if (length >= 1) {
      messageBox.push({
        message: {
        to: pushList[0].user_deviceToken,
        collapse_key: 'Updates Available',
        data: {
          title: "Every Foody",
          body: sendMessage[0]
        }
      }
    });
  }
  if (length > 1 && length <= 2) {
      messageBox.push({
        message: {
        to: pushList[1].user_deviceToken,
        collapse_key: 'Updates Available',
        data: {
          title: "Every Foody",
          body: sendMessage[1]
        }
      }
    });
  }
  if (length >= 6) {
      messageBox.push({
      message: {
        to: pushList[5].user_deviceToken,
        collapse_key: 'Updates Available',
        data: {
          title: "Every Foody",
          body: sendMessage[5]
        }
      }
    });
  }
    return messageBox;
}

exports.saveMessage = (notiInfo, pushList) => {  
  var length = pushList.length;
  if (length >= 1) {
     notiInfo.push({
      user_id : pushList[0].user_id,
      notice_content : sendMessage[0],
      notice_time : moment().format('MM/DDahh:mm:ss');
    });
  }
  if (length >=2) {
    notiInfo.push({
      user_id : pushList[1].user_id,
      notice_content : sendMessage[1],
      notice_time : moment().format('MM/DDahh:mm:ss');
    });
  }
  if (length >= 6) {
    notiInfo.push({
      user_id : pushList[5].user_id,
      notice_content : sendMessage[5],
      notice_time : moment().format('MM/DDahh:mm:ss');
    });
  }
  return notiInfo;
}

