// 测试页面 - 测试火山引擎 Ark API 食物识别
const ARK_CONFIG = {
  apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  apiKey: 'cc0c732d-8078-45d5-b8ef-08a22586d1e1'
};

Page({
  data: {
    model: 'doubao-1-5-vision-pro-32k-250115',
    imagePath: '',
    imageName: '',
    imageBase64: '',
    message: '请识别图片中的食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。',
    result: ''
  },

  onModelChange(e) {
    this.setData({ model: e.detail });
  },

  onMessageChange(e) {
    this.setData({ message: e.detail });
  },

  // 选择图片
  chooseImage() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        } else if (res.tapIndex === 1) {
          this.chooseImageFromAlbum();
        }
      },
      fail: (err) => {
        console.error('选择图片方式失败:', err);
      }
    });
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        this.handleImageSelected(res.tempFiles[0]);
      },
      fail: (err) => {
        console.error('拍照失败:', err);
      }
    });
  },

  // 从相册选择
  chooseImageFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.handleImageSelected(res.tempFiles[0]);
      },
      fail: (err) => {
        console.error('从相册选择图片失败:', err);
      }
    });
  },

  // 处理选中的图片
  handleImageSelected(tempFile) {
    const imagePath = tempFile.tempFilePath;
    const imageName = tempFile.tempFilePath.split('/').pop();

    this.setData({
      imagePath: imagePath,
      imageName: imageName
    });

    // 将图片转换为base64
    this.convertImageToBase64(imagePath);
  },

  // 将图片转换为base64
  convertImageToBase64(imagePath) {
    wx.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (res) => {
        this.setData({
          imageBase64: 'data:image/jpeg;base64,' + res.data
        });
        console.log('图片转换为base64成功');
      },
      fail: (err) => {
        console.error('图片转换为base64失败:', err);
        wx.showToast({
          title: '图片处理失败',
          icon: 'none'
        });
      }
    });
  },

  // 移除图片
  removeImage() {
    this.setData({
      imagePath: '',
      imageName: '',
      imageBase64: ''
    });
  },

  // 测试API
  testArkAPI() {
    if (!this.data.imageBase64) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '识别中...' });

    const requestData = {
      model: this.data.model,
      messages: [
        {
          content: [
            {
              image_url: {
                url: this.data.imageBase64
              },
              type: 'image_url'
            },
            {
              text: this.data.message,
              type: 'text'
            }
          ],
          role: 'user'
        }
      ]
    };

    console.log('请求数据:', requestData);
    this.setData({ result: '正在分析图片...\n' + JSON.stringify(requestData, null, 2) });

    wx.request({
      url: ARK_CONFIG.apiUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_CONFIG.apiKey}`
      },
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        console.log('API 返回:', res);

        if (res.statusCode === 200) {
          const response = res.data;
          let output = '✅ 识别成功！\n\n';

          if (response.choices && response.choices.length > 0) {
            output += '识别结果:\n' + response.choices[0].message.content;
          } else {
            output += '完整响应:\n' + JSON.stringify(response, null, 2);
          }

          this.setData({ result: output });
        } else {
          this.setData({
            result: '❌ 请求失败\n\n状态码: ' + res.statusCode + '\n\n错误信息:\n' + JSON.stringify(res.data, null, 2)
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        this.setData({
          result: '❌ 请求失败\n\n' + JSON.stringify(err, null, 2) + '\n\n提示: 请在微信开发者工具中开启"不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书"选项'
        });
      }
    });
  }
});
