// 讯飞星火API配置
const XFYUN_CONFIG = {
  appId: 'e25b0af8',
  apiKey: 'e983ca33eaa8d2f299061c4f53d0393d',
  apiSecret: 'NTUxYTlkYTEzZjY3MGFhNDVjMDhkNzA0',
  hostUrl: 'wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image'
};

/**
 * 生成讯飞星火API的鉴权URL
 */
function getAuthUrl() {
  const url = new URL(XFYUN_CONFIG.hostUrl);
  const host = url.host;
  const path = url.pathname;
  const date = new Date().toUTCString();

  // 构建签名原文
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

  // 使用HMAC-SHA256加密
  const crypto = require('crypto-js');
  const signatureSha = crypto.HmacSHA256(signatureOrigin, XFYUN_CONFIG.apiSecret);
  const signature = crypto.enc.Base64.stringify(signatureSha);

  // 构建authorization
  const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  // 构建完整URL
  return `${XFYUN_CONFIG.hostUrl}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

/**
 * 调用讯飞星火API分析食物
 * @param {string} imageBase64 - 图片base64字符串
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    let fullResponse = '';

    // 创建WebSocket连接
    const socketTask = wx.connectSocket({
      url: getAuthUrl(),
      success: () => {
        console.log('WebSocket连接成功');
      },
      fail: (error) => {
        reject(new Error('WebSocket连接失败: ' + error.errMsg));
      }
    });

    // 连接打开时发送请求
    socketTask.onOpen(() => {
      const params = {
        header: {
          app_id: XFYUN_CONFIG.appId,
          uid: 'user_' + Date.now()
        },
        parameter: {
          chat: {
            domain: 'image',
            temperature: 0.5,
            max_tokens: 1024
          }
        },
        payload: {
          message: {
            text: [
              {
                role: 'user',
                content: '请识别这个食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。',
                content_type: 'text'
              },
              {
                role: 'user',
                content: imageBase64,
                content_type: 'image'
              }
            ]
          }
        }
      };

      socketTask.send({
        data: JSON.stringify(params),
        success: () => {
          console.log('发送请求成功');
        },
        fail: (error) => {
          reject(new Error('发送请求失败: ' + error.errMsg));
        }
      });
    });

    // 接收消息
    socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);

        if (data.header.code !== 0) {
          socketTask.close();
          reject(new Error(`API错误: ${data.header.message}`));
          return;
        }

        // 拼接响应内容
        if (data.payload && data.payload.choices && data.payload.choices.text) {
          const text = data.payload.choices.text;
          if (text && text.length > 0) {
            fullResponse += text[0].content;
          }
        }

        // 检查是否结束
        if (data.header.status === 2) {
          socketTask.close();

          // 解析JSON响应
          try {
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const foodInfo = JSON.parse(jsonMatch[0]);
              resolve(foodInfo);
            } else {
              reject(new Error('无法解析AI返回的数据: ' + fullResponse));
            }
          } catch (error) {
            reject(new Error('解析JSON失败: ' + error.message));
          }
        }
      } catch (error) {
        socketTask.close();
        reject(new Error('处理响应失败: ' + error.message));
      }
    });

    // 错误处理
    socketTask.onError((error) => {
      reject(new Error('WebSocket错误: ' + JSON.stringify(error)));
    });

    // 连接关闭
    socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
    });
  });
}

module.exports = {
  analyzeFood
};
