const crypto = require('crypto');
const WebSocket = require('ws');

// 讯飞星火配置
const XFYUN_CONFIG = {
  appId: 'e25b0af8',
  apiKey: 'e983ca33eaa8d2f299061c4f53d0393d',
  apiSecret: '551a9da13f670aa45c08d704',
  hostUrl: 'wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image'
};

/**
 * 生成鉴权URL
 */
function getAuthUrl() {
  const host = 'spark-api.cn-huabei-1.xf-yun.com';
  const path = '/v2.1/image';
  const date = new Date().toUTCString();

  // 构建签名原文
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

  // HMAC-SHA256签名
  const signature = crypto
    .createHmac('sha256', XFYUN_CONFIG.apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  // 构建authorization
  const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  // 返回完整URL（在Node.js环境中不会被自动编码）
  return `${XFYUN_CONFIG.hostUrl}?authorization=${authorization}&date=${date}&host=${host}`;
}

/**
 * 调用讯飞星火API分析食物
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    const authUrl = getAuthUrl();
    console.log('连接URL:', authUrl);

    const ws = new WebSocket(authUrl);
    let fullResponse = '';

    ws.on('open', () => {
      console.log('WebSocket连接已打开');

      const params = {
        header: {
          app_id: XFYUN_CONFIG.appId,
          uid: 'cloud_' + Date.now()
        },
        parameter: {
          chat: {
            domain: 'image',
            temperature: 0.5,
            max_tokens: 2048
          }
        },
        payload: {
          message: {
            text: [
              {
                role: 'user',
                content: imageBase64,
                content_type: 'image'
              },
              {
                role: 'user',
                content: '请识别这个食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。',
                content_type: 'text'
              }
            ]
          }
        }
      };

      ws.send(JSON.stringify(params));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());
      console.log('收到消息:', response);

      if (response.header.code !== 0) {
        ws.close();
        reject(new Error(`API错误 [${response.header.code}]: ${response.header.message}`));
        return;
      }

      // 拼接响应内容
      if (response.payload && response.payload.choices && response.payload.choices.text) {
        const text = response.payload.choices.text;
        if (text && text.length > 0) {
          fullResponse += text[0].content;
        }
      }

      // 检查是否结束
      if (response.header.status === 2) {
        ws.close();

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
    });

    ws.on('error', (error) => {
      console.error('WebSocket错误:', error);
      reject(new Error('WebSocket错误: ' + error.message));
    });

    ws.on('close', () => {
      console.log('WebSocket连接已关闭');
    });
  });
}

// 云函数入口
exports.main = async (event, context) => {
  try {
    const { imageBase64 } = event;

    if (!imageBase64) {
      return {
        success: false,
        error: '缺少图片数据'
      };
    }

    const result = await analyzeFood(imageBase64);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
