// 讯飞星火API配置
const XFYUN_CONFIG = {
  appId: 'e25b0af8',
  apiKey: 'e983ca33eaa8d2f299061c4f53d0393d',
  apiSecret: '551a9da13f670aa45c08d704',
  hostUrl: 'wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image'
};

/**
 * 生成讯飞星火API的鉴权URL
 */
function getAuthUrl() {
  const crypto = require('crypto-js');

  // 解析URL
  const url = XFYUN_CONFIG.hostUrl;
  const host = 'spark-api.cn-huabei-1.xf-yun.com';
  const path = '/v2.1/image';

  // 生成RFC1123格式的时间戳
  const date = new Date().toUTCString();

  // 拼接签名原始字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

  // 使用hmac-sha256算法结合apiSecret对signatureOrigin签名，获得签名后的摘要signature
  const signature = crypto.enc.Base64.stringify(
    crypto.HmacSHA256(signatureOrigin, XFYUN_CONFIG.apiSecret)
  );

  // 使用apiKey、signature、algorithm组成authorization
  const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

  // 将authorization进行base64编码
  const authorization = crypto.enc.Base64.stringify(
    crypto.enc.Utf8.parse(authorizationOrigin)
  );

  // 手动拼接URL，避免微信小程序自动编码
  // 注意：这里不使用模板字符串拼接参数，而是直接返回完整字符串
  const authUrl = url + '?authorization=' + authorization + '&date=' + date + '&host=' + host;

  console.log('生成的认证URL:', authUrl);

  return authUrl;
}

/**
 * 调用讯飞星火API分析食物
 * @param {string} imageBase64 - 图片base64字符串
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    let fullResponse = '';

    console.log('开始生成鉴权URL...');
    const authUrl = getAuthUrl();
    console.log('鉴权URL:', authUrl);

    // 创建WebSocket连接
    const socketTask = wx.connectSocket({
      url: authUrl,
      header: {
        'content-type': 'application/json'
      },
      protocols: [],
      success: () => {
        console.log('connectSocket调用成功');
      },
      fail: (error) => {
        console.error('connectSocket调用失败:', error);
        reject(new Error('WebSocket连接失败: ' + JSON.stringify(error)));
      }
    });

    // 监听连接打开
    socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
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

      console.log('准备发送数据...');

      socketTask.send({
        data: JSON.stringify(params),
        success: () => {
          console.log('数据发送成功');
        },
        fail: (error) => {
          console.error('数据发送失败:', error);
          reject(new Error('发送请求失败: ' + JSON.stringify(error)));
        }
      });
    });

    // 接收消息
    socketTask.onMessage((res) => {
      console.log('收到消息:', res.data);
      try {
        const data = JSON.parse(res.data);

        if (data.header.code !== 0) {
          console.error('API返回错误:', data.header);
          socketTask.close();
          reject(new Error(`API错误 [${data.header.code}]: ${data.header.message}`));
          return;
        }

        // 拼接响应内容
        if (data.payload && data.payload.choices && data.payload.choices.text) {
          const text = data.payload.choices.text;
          if (text && text.length > 0) {
            fullResponse += text[0].content;
            console.log('累积响应:', fullResponse);
          }
        }

        // 检查是否结束
        if (data.header.status === 2) {
          console.log('接收完成，完整响应:', fullResponse);
          socketTask.close();

          // 解析JSON响应
          try {
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const foodInfo = JSON.parse(jsonMatch[0]);
              console.log('解析成功:', foodInfo);
              resolve(foodInfo);
            } else {
              console.error('无法提取JSON:', fullResponse);
              reject(new Error('无法解析AI返回的数据: ' + fullResponse));
            }
          } catch (error) {
            console.error('JSON解析失败:', error);
            reject(new Error('解析JSON失败: ' + error.message));
          }
        }
      } catch (error) {
        console.error('处理响应失败:', error);
        socketTask.close();
        reject(new Error('处理响应失败: ' + error.message));
      }
    });

    // 错误处理
    socketTask.onError((error) => {
      console.error('WebSocket错误:', error);
      reject(new Error('WebSocket错误: ' + JSON.stringify(error)));
    });

    // 连接关闭
    socketTask.onClose((res) => {
      console.log('WebSocket连接已关闭, code:', res.code, 'reason:', res.reason);
    });
  });
}

module.exports = {
  analyzeFood
};
