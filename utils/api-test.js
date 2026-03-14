// 测试讯飞星火API连接
const XFYUN_CONFIG = {
  appId: 'e25b0af8',
  apiKey: 'e983ca33eaa8d2f299061c4f53d0393d',
  apiSecret: '551a9da13f670aa45c08d704',
  hostUrl: 'wss://spark-api.xf-yun.com/v3.5/chat'  // 使用通用对话API测试
};

function testConnection() {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto-js');

    const host = 'spark-api.xf-yun.com';
    const path = '/v3.5/chat';
    const date = new Date().toUTCString();

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = crypto.enc.Base64.stringify(
      crypto.HmacSHA256(signatureOrigin, XFYUN_CONFIG.apiSecret)
    );

    const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = crypto.enc.Base64.stringify(
      crypto.enc.Utf8.parse(authorizationOrigin)
    );

    const authUrl = XFYUN_CONFIG.hostUrl + '?authorization=' + authorization + '&date=' + date + '&host=' + host;

    console.log('测试连接URL:', authUrl);

    const socketTask = wx.connectSocket({
      url: authUrl,
      success: () => {
        console.log('连接创建成功');
      },
      fail: (error) => {
        console.error('连接创建失败:', error);
        reject(error);
      }
    });

    socketTask.onOpen(() => {
      console.log('WebSocket已打开');

      const params = {
        header: {
          app_id: XFYUN_CONFIG.appId,
          uid: 'test_' + Date.now()
        },
        parameter: {
          chat: {
            domain: 'generalv3.5',
            temperature: 0.5,
            max_tokens: 1024
          }
        },
        payload: {
          message: {
            text: [
              {
                role: 'user',
                content: '你好'
              }
            ]
          }
        }
      };

      socketTask.send({
        data: JSON.stringify(params),
        success: () => {
          console.log('消息发送成功');
        },
        fail: (error) => {
          console.error('消息发送失败:', error);
          reject(error);
        }
      });
    });

    socketTask.onMessage((res) => {
      console.log('收到响应:', res.data);
      const data = JSON.parse(res.data);
      if (data.header.code === 0) {
        console.log('✅ 连接测试成功！');
        resolve(data);
      } else {
        console.error('❌ API返回错误:', data.header);
        reject(data.header);
      }
      socketTask.close();
    });

    socketTask.onError((error) => {
      console.error('WebSocket错误:', error);
      reject(error);
    });

    socketTask.onClose((res) => {
      console.log('连接关闭, code:', res.code, 'reason:', res.reason);
    });
  });
}

module.exports = {
  testConnection
};
