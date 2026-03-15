const { compressImage, imageToBase64, saveImageToLocal } = require('../../utils/image');
const { analyzeFood } = require('../../utils/api');
const { addFood } = require('../../utils/storage');
const { calculateExpiryDate, formatDate } = require('../../utils/date');

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic'];

Page({
  data: {
    photo: '',
    tempPhotoPath: '',
    name: '',
    expiryDays: '',
    storageAdvice: '',
    nutrition: '',
    category: '',
    isAnalyzing: false,
    isAnalyzed: false,
    showManualInput: false
  },

  // 检查图片格式是否支持
  isImageFormatSupported(filePath) {
    if (!filePath) return false;
    const lowerPath = filePath.toLowerCase();
    return SUPPORTED_FORMATS.some(format => lowerPath.includes(format));
  },

  // 获取文件扩展名
  getFileExtension(filePath) {
    if (!filePath) return '';
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFile = res.tempFiles[0];
        const tempFilePath = tempFile.tempFilePath;
        const fileExt = this.getFileExtension(tempFilePath);

        console.log('选择的图片:', tempFilePath, '格式:', fileExt);

        // 检查图片格式
        if (!this.isImageFormatSupported(tempFilePath)) {
          wx.showModal({
            title: '提示',
            content: `当前格式 (.${fileExt}) 可能不完全支持。\n推荐使用: ${SUPPORTED_FORMATS.join('、')}`,
            confirmText: '继续使用',
            cancelText: '重新选择',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.processImage(tempFilePath);
              } else {
                this.chooseImage();
              }
            }
          });
        } else {
          this.processImage(tempFilePath);
        }
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理选择的图片
  processImage(filePath) {
    this.setData({
      photo: filePath,
      tempPhotoPath: filePath
    });
    this.analyzeImage(filePath);
  },

  async analyzeImage(filePath) {
    console.log('开始分析图片，路径:', filePath);
    this.setData({ isAnalyzing: true });

    try {
      // 检查文件路径是否有效
      if (!filePath) {
        throw new Error('图片路径无效');
      }

      // 压缩图片
      console.log('开始压缩图片');
      let processedPath = filePath;
      try {
        processedPath = await compressImage(filePath);
        console.log('图片压缩成功，压缩后路径:', processedPath);
      } catch (compressError) {
        console.warn('图片压缩失败，使用原始图片:', compressError);
        processedPath = filePath; // 压缩失败时使用原始图片
      }

      // 转换为base64
      console.log('开始转换为base64');
      let base64 = '';
      try {
        base64 = await imageToBase64(processedPath);
        console.log('图片转换为base64成功，长度:', base64.length);
      } catch (convertError) {
        console.error('图片转换为base64失败:', convertError);
        throw new Error('图片处理失败');
      }

      // 检查base64是否有效
      if (!base64 || base64.length < 100) {
        throw new Error('图片数据不完整');
      }

      // 调用AI分析
      console.log('开始调用AI分析');
      const foodInfo = await analyzeFood(base64);
      console.log('AI分析完成，结果:', foodInfo);

      this.setData({
        name: foodInfo.name || '',
        expiryDays: foodInfo.expiryDays || '',
        storageAdvice: foodInfo.storageAdvice || '',
        nutrition: foodInfo.nutrition || '',
        category: foodInfo.category || '',
        isAnalyzing: false,
        isAnalyzed: true
      });

      wx.showToast({
        title: '识别成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('识别失败:', error);
      this.setData({
        isAnalyzing: false,
        showManualInput: true
      });

      wx.showModal({
        title: '识别失败',
        content: error.message + '，是否手动输入？',
        confirmText: '手动输入',
        cancelText: '重新拍照',
        success: (res) => {
          if (!res.confirm) {
            this.chooseImage();
          }
        }
      });
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail });
  },

  onExpiryDaysInput(e) {
    this.setData({ expiryDays: e.detail });
  },

  onStorageAdviceInput(e) {
    this.setData({ storageAdvice: e.detail });
  },

  onNutritionInput(e) {
    this.setData({ nutrition: e.detail });
  },

  onCategoryInput(e) {
    this.setData({ category: e.detail });
  },

  async saveFood() {
    const { name, expiryDays, storageAdvice, nutrition, category, tempPhotoPath } = this.data;

    // 验证必填字段
    if (!name) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      });
      return;
    }

    if (!expiryDays || isNaN(expiryDays) || parseInt(expiryDays) <= 0) {
      wx.showToast({
        title: '请输入有效的保质天数',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '保存中...' });

      // 保存图片到本地
      const savedPhotoPath = await saveImageToLocal(tempPhotoPath);

      // 创建食物对象
      const food = {
        id: Date.now().toString(),
        name,
        photo: savedPhotoPath,
        addDate: formatDate(new Date()),
        expiryDate: calculateExpiryDate(parseInt(expiryDays)),
        storageAdvice,
        nutrition,
        category
      };

      // 保存到本地存储
      addFood(food);

      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  cancel() {
    wx.navigateBack();
  }
});
