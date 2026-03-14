App({
  onLaunch() {
    // 初始化本地存储
    try {
      const foodList = wx.getStorageSync('foodList');
      if (!foodList) {
        wx.setStorageSync('foodList', []);
      }
    } catch (e) {
      console.error('Failed to initialize foodList:', e);
    }

    try {
      const alertDays = wx.getStorageSync('alertDays');
      if (!alertDays) {
        wx.setStorageSync('alertDays', 3);
      }
    } catch (e) {
      console.error('Failed to initialize alertDays:', e);
    }

    // 初始化API Key（如果未设置）
    try {
      const apiKey = wx.getStorageSync('apiKey');
      if (!apiKey) {
        wx.setStorageSync('apiKey', 'd382db25-0b3d-4a12-8e46-3f80c3d9e358');
      }
    } catch (e) {
      console.error('Failed to initialize apiKey:', e);
    }
  },

  onShow() {
    // 检查即将过期的食物
    this.checkExpiringFoods();
  },

  checkExpiringFoods() {
    let foodList = [];
    let alertDays = 3;

    try {
      foodList = wx.getStorageSync('foodList') || [];
      alertDays = wx.getStorageSync('alertDays') || 3;
    } catch (e) {
      console.error('Failed to read storage:', e);
      return;
    }

    const today = new Date();
    const expiringFoods = foodList.filter(food => {
      if (!food.expiryDate || typeof food.expiryDate !== 'string') {
        return false;
      }
      const expiryDate = new Date(food.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        return false;
      }
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= alertDays;
    });

    if (expiringFoods.length > 0) {
      wx.showModal({
        title: '食物即将过期',
        content: `您有 ${expiringFoods.length} 件食物即将过期`,
        confirmText: '查看',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/index/index',
              fail: (err) => {
                console.error('Failed to switch tab:', err);
              }
            });
          }
        }
      });
    }
  },

  globalData: {
    userInfo: null
  }
});
