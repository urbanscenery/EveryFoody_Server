var ownerMessage = ['음식받으러 오세요','현재 대기번호 1번 입니다.','현재 대기번호 5번 입니다.'];

module.exports.sendMessage = function(length, messageBox,pushList ) {
  if (length >= 1) {
      messageBox.push({
        message: {
        to: pushList[0].user_deviceToken,
        collapse_key: 'Updates Available2',
        data: {
          title: "Every Foody",
          body: ownerMessage[0]
        }
      }
    });
  }
  if (length >=2) {
      messageBox.push({
        message: {
        to: pushList[1].user_deviceToken,
        collapse_key: 'Updates Available3',
        data: {
          title: "Every Foody",
          body: ownerMessage[1]
        }
      }
    });
  }
  if (length >= 6) {
      messageBox.push({
      message: {
        to: pushList[5].user_deviceToken,
        collapse_key: 'Updates Available5',
        data: {
          title: "Every Foody",
          body: ownerMessage[2]
        }
      }
    });
  }
  return messageBox;
}

module.exports.saveMessage = (notiInfo, pushUserID) => {
  var notiInfo = []
  var length = pushUserID.length;
  if (length >= 1) {
     notiInfo.push({
      user_id : pushUserID[5],
      notice_content : sendMessage[2],
      notice_time : moment().format('MM/DDahh:mm:ss')
    });
  }
  if (length > 1 && length <= 2) {
    notiInfo.push({
      user_id : pushUserID[5],
      notice_content : sendMessage[2],
      notice_time : moment().format('MM/DDahh:mm:ss')
    });
  }
  if (length >= 6) {
    notiInfo.push({
      user_id : pushUserID[5],
      notice_content : sendMessage[2],
      notice_time : moment().format('MM/DDahh:mm:ss')
    });
  }
  return notiInfo;
}

