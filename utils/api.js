// 火山引擎 Ark API 配置
const ARK_CONFIG = {
  apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  apiKey: 'cc0c732d-8078-45d5-b8ef-08a22586d1e1',
  model: 'doubao-1-5-vision-pro-32k-250115'
};

/**
 * 调用火山引擎 Ark API 分析食物
 * @param {string} imageBase64 - 图片base64字符串（不带 data:image/jpeg;base64, 前缀）
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    console.log('开始调用火山引擎 Ark API 分析食物');

    // 检查 base64 数据是否有效
    if (!imageBase64 || imageBase64.length < 100) {
      console.error('无效的 base64 图片数据');
      reject(new Error('图片数据无效'));
      return;
    }

    console.log('图片 base64 长度:', imageBase64.length);

    const requestData = {
      model: ARK_CONFIG.model,
      messages: [
        {
          content: [
            {
              image_url: {
                url: 'data:image/jpeg;base64,' + imageBase64
              },
              type: 'image_url'
            },
            {
              text: '请识别图片中的食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。',
              type: 'text'
            }
          ],
          role: 'user'
        }
      ]
    };

    console.log('请求数据:', JSON.stringify(requestData));

    wx.request({
      url: ARK_CONFIG.apiUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_CONFIG.apiKey}`
      },
      data: requestData,
      success: (res) => {
        console.log('Ark API 返回状态码:', res.statusCode);
        console.log('Ark API 返回数据:', res);

        if (res.statusCode === 200) {
          try {
            if (!res.data || !res.data.choices || res.data.choices.length === 0) {
              reject(new Error('API 响应数据格式错误'));
              return;
            }

            const responseText = res.data.choices[0].message.content;
            console.log('AI 响应文本:', responseText);

            // 提取 JSON 部分
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const foodInfo = JSON.parse(jsonMatch[0]);
              console.log('解析的食物信息:', foodInfo);

              // 验证解析后的数据
              if (!foodInfo.name || !foodInfo.expiryDays) {
                reject(new Error('食物信息解析不完整'));
              } else {
                resolve(foodInfo);
              }
            } else {
              reject(new Error('无法解析AI返回的JSON格式'));
            }
          } catch (error) {
            console.error('解析AI响应失败:', error);
            reject(new Error('解析AI响应失败: ' + error.message));
          }
        } else {
          reject(new Error('API 请求失败: ' + res.statusCode));
        }
      },
      fail: (error) => {
        console.error('请求发送失败:', error);
        reject(new Error('请求失败: ' + error.errMsg));
      }
    });
  });
}

module.exports = {
  analyzeFood
};
