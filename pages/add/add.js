const { compressImage, imageToBase64, saveImageToLocal } = require('../../utils/image');
const { analyzeFood } = require('../../utils/api');
const { addFood } = require('../../utils/storage');
const { calculateExpiryDate, formatDate } = require('../../utils/date');

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

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          photo: tempFilePath,
          tempPhotoPath: tempFilePath
        });
        this.analyzeImage(tempFilePath);
      },
      fail: (error) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  async analyzeImage(filePath) {
    this.setData({ isAnalyzing: true });

    try {
      // 压缩图片
      const compressedPath = await compressImage(filePath);

      // 转换为base64
      const base64 = await imageToBase64(compressedPath);

      // 调用AI分析
      const foodInfo = await analyzeFood(base64);

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

    if (!expiryDays || isNaN(expiryDays) || expiryDays <= 0) {
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
