App({
  onLaunch() {
    // 初始化本地存储
    const foodList = wx.getStorageSync('foodList');
    if (!foodList) {
      wx.setStorageSync('foodList', []);
    }

    const alertDays = wx.getStorageSync('alertDays');
    if (!alertDays) {
      wx.setStorageSync('alertDays', 3);
    }
  },

  onShow() {
    // 检查即将过期的食物
    this.checkExpiringFoods();
  },

  checkExpiringFoods() {
    const foodList = wx.getStorageSync('foodList') || [];
    const alertDays = wx.getStorageSync('alertDays') || 3;

    const today = new Date();
    const expiringFoods = foodList.filter(food => {
      const expiryDate = new Date(food.expiryDate);
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
            wx.switchTab({ url: '/pages/index/index' });
          }
        }
      });
    }
  },

  globalData: {
    userInfo: null
  }
});
