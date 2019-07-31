const login = require("facebook-chat-api");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

let headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.SIMSIMI_API_KEY
};

fs.readFile('restrictedList.json', 'utf-8', (err, data) => {
    if (err) throw err;
    let restrictedList = JSON.parse(data);
    let users = {};
    login({
        email: process.env.FB_EMAIL,
        password: process.env.FB_PASSWORD
    }, (err, api) => {
        if (err) return console.error(err);
        api.listen((err, message) => {
            if (!message) return;
            if (restrictedList[message.senderID]) return;
            if (!users[message.senderID] && message.isGroup === true) {
                api.sendMessage(`*Cụ Tokuda:* ${helloGroup}`, message.threadID);
                api.sendMessage(warning, message.threadID);
                users[message.senderID] = true;
            } else if (!users[message.senderID] && message.isGroup === false) {
                api.sendMessage(`*Cụ Tokuda:* ${hello(message.senderID)}`, message.threadID);
                api.sendMessage(warning, message.threadID);
                users[message.senderID] = true;
            } else if (message.body === 'con yeu cu tokuda') {
                console.log(message.body);
                api.sendMessage('Ok, cụ cũng yêu con <3', message.threadID);
                if (message.isGroup) api.sendMessage('Được rồi cụ đi đây, nhưng ai nói gì cụ vẫn nghe đc hết đấy nhé :)', message.threadID);
                restrictedList[message.senderID] = true;
            } else {
                axios({
                    method: 'post',
                    url: 'https://wsapi.simsimi.com/190410/talk',
                    data: formatMessage(message),
                    headers: headers
                }).then(response => {
                    console.log(response.data);
                    api.sendMessage(`*Cụ Tokuda:* ${response.data.atext}`, message.threadID);
                }).catch(err => {
                    console.log(err.toString());
                    api.sendMessage(`Xin lỗi *cụ Tokuda* đang bị đơ :(`, message.threadID);
                })
            }
        });
    });
});

const warning = 'Nếu không thích nói chuyện với *cụ Tokuda*, bạn hãy nhắn *con yeu cu tokuda* để cụ dừng lại nhé !';
const helloGroup = 'Chào các bạn, mình là *cụ Tokuda*! Hiện tại Thưởng không có ở đây nên mình sẽ trò chuyện thay cậu ấy nhé <3';
const hello = (id) => {
    return `Chào bạn \\(${id}\\), mình là *cụ Tokuda*! Hiện tại Thưởng không có ở đây nên mình sẽ trò chuyện thay cậu ấy nhé <3`
};
const formatMessage = (message) => {
    return {
        utext: message.body,
        lang: "vi"
    }
};