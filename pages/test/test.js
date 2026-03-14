// 测试页面 - 测试讯飞星火通用对话API
const crypto = require('crypto-js');

const XFYUN_CONFIG = {
  appId: 'e25b0af8',
  apiKey: 'e983ca33eaa8d2f299061c4f53d0393d',
  apiSecret: '551a9da13f670aa45c08d704'
};

Page({
  data: {
    result: ''
  },

  testConnection() {
    const host = 'spark-api.xf-yun.com';
    const path = '/v3.5/chat';
    const date = new Date().toGMTString();

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = crypto.enc.Base64.stringify(
      crypto.HmacSHA256(signatureOrigin, XFYUN_CONFIG.apiSecret)
    );

    const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = crypto.enc.Base64.stringify(
      crypto.enc.Utf8.parse(authorizationOrigin)
    );

    const url = `wss://${host}${path}?authorization=${authorization}&date=${date}&host=${host}`;

    console.log('测试URL:', url);

    const socketTask = wx.connectSocket({
      url: url,
      success: () => {
        console.log('✅ 连接创建成功');
        this.setData({ result: '连接创建成功...' });
      },
      fail: (error) => {
        console.error('❌ 连接创建失败:', error);
        this.setData({ result: '连接失败: ' + JSON.stringify(error) });
      }
    });

    socketTask.onOpen(() => {
      console.log('✅ WebSocket已打开');
      this.setData({ result: 'WebSocket已打开，发送测试消息...' });

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
                content: '你好，请回复"测试成功"'
              }
            ]
          }
        }
      };

      socketTask.send({
        data: JSON.stringify(params),
        success: () => {
          console.log('✅ 消息发送成功');
        },
        fail: (error) => {
          console.error('❌ 消息发送失败:', error);
          this.setData({ result: '发送失败: ' + JSON.stringify(error) });
        }
      });
    });

    socketTask.onMessage((res) => {
      console.log('✅ 收到响应:', res.data);
      const data = JSON.parse(res.data);

      if (data.header.code === 0) {
        let content = '';
        if (data.payload && data.payload.choices && data.payload.choices.text) {
          content = data.payload.choices.text[0].content;
        }
        this.setData({ result: '✅ 测试成功！收到回复: ' + content });

        if (data.header.status === 2) {
          socketTask.close();
        }
      } else {
        console.error('❌ API返回错误:', data.header);
        this.setData({ result: '❌ API错误: ' + data.header.message });
        socketTask.close();
      }
    });

    socketTask.onError((error) => {
      console.error('❌ WebSocket错误:', error);
      this.setData({ result: '❌ WebSocket错误: ' + JSON.stringify(error) });
    });

    socketTask.onClose((res) => {
      console.log('连接关闭, code:', res.code, 'reason:', res.reason);
    });
  }
});
