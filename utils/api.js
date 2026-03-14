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

  const host = 'spark-api.cn-huabei-1.xf-yun.com';
  const path = '/v2.1/image';
  const date = new Date().toGMTString(); // 使用toGMTString而不是toUTCString

  console.log('Date:', date);

  // 构建签名原文
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  console.log('签名原文:', signatureOrigin);

  // 使用HMAC-SHA256加密
  const signatureSha = crypto.HmacSHA256(signatureOrigin, XFYUN_CONFIG.apiSecret);
  const signature = crypto.enc.Base64.stringify(signatureSha);
  console.log('Signature:', signature);

  // 构建authorization原文
  const authorizationOrigin = `api_key="${XFYUN_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  console.log('Authorization原文:', authorizationOrigin);

  // Base64编码authorization
  const authorizationBase64 = crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(authorizationOrigin));
  console.log('Authorization Base64:', authorizationBase64);

  // 构建最终URL - 不对任何参数进行encodeURIComponent
  const finalUrl = `wss://${host}${path}?authorization=${authorizationBase64}&date=${date}&host=${host}`;
  console.log('最终URL:', finalUrl);

  return finalUrl;
}

/**
 * 调用云函数分析食物（通过云函数代理讯飞星火API）
 * @param {string} imageBase64 - 图片base64字符串
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    console.log('调用云函数分析食物...');

    wx.cloud.callFunction({
      name: 'analyzeFood',
      data: {
        imageBase64: imageBase64
      },
      success: (res) => {
        console.log('云函数调用成功:', res);

        if (res.result.success) {
          resolve(res.result.data);
        } else {
          reject(new Error(res.result.error || '识别失败'));
        }
      },
      fail: (error) => {
        console.error('云函数调用失败:', error);
        reject(new Error('云函数调用失败: ' + error.errMsg));
      }
    });
  });
}

module.exports = {
  analyzeFood
};
