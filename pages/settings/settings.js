const { getAlertDays, saveAlertDays, getApiKey, saveApiKey, saveFoodList } = require('../../utils/storage');

Page({
  data: {
    alertDays: 3,
    apiKey: ''
  },

  onLoad() {
    this.loadSettings();
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    const alertDays = getAlertDays();
    const apiKey = getApiKey();

    this.setData({
      alertDays,
      apiKey
    });
  },

  onAlertDaysChange(e) {
    const alertDays = e.detail;
    this.setData({ alertDays });

    try {
      saveAlertDays(alertDays);
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      });
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  onApiKeyInput(e) {
    this.setData({ apiKey: e.detail });
  },

  saveApiKey() {
    const { apiKey } = this.data;

    if (!apiKey) {
      wx.showToast({
        title: '请输入API Key',
        icon: 'none'
      });
      return;
    }

    try {
      saveApiKey(apiKey);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  confirmClearData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有食物数据吗？此操作不可恢复！',
      confirmText: '清空',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          this.clearData();
        }
      }
    });
  },

  clearData() {
    try {
      saveFoodList([]);
      wx.showToast({
        title: '清空成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '清空失败',
        icon: 'none'
      });
    }
  },

  showAbout() {
    wx.showModal({
      title: '关于',
      content: '冰箱食物追踪小程序 v1.0.0\n\n帮助您管理冰箱食物，避免浪费。',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
