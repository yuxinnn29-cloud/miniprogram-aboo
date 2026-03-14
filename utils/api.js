const { getApiKey } = require('./storage');

/**
 * 调用火山引擎API分析食物
 * @param {string} imageBase64 - 图片base64字符串
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      reject(new Error('请先在设置中配置API Key'));
      return;
    }

    wx.request({
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'doubao-vision-pro',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: '请识别这个食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。'
            }
          ]
        }]
      },
      success: (res) => {
        try {
          if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
            const content = res.data.choices[0].message.content;
            // 尝试提取JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const foodInfo = JSON.parse(jsonMatch[0]);
              resolve(foodInfo);
            } else {
              reject(new Error('无法解析AI返回的数据'));
            }
          } else {
            reject(new Error('API调用失败'));
          }
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      },
      fail: (error) => {
        reject(new Error('网络请求失败: ' + error.errMsg));
      }
    });
  });
}

module.exports = {
  analyzeFood
};
