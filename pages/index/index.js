const { getFoodList } = require('../../utils/storage');
const { calculateDaysRemaining, getFoodStatus } = require('../../utils/date');

Page({
  data: {
    foodList: [],
    normalFoods: [],
    expiringFoods: [],
    expiredFoods: []
  },

  onLoad() {
    this.loadFoodList();
  },

  onShow() {
    this.loadFoodList();
  },

  loadFoodList() {
    const foodList = getFoodList();

    // 计算每个食物的剩余天数和状态
    const processedList = foodList.map(food => {
      const daysRemaining = calculateDaysRemaining(food.expiryDate);
      const status = getFoodStatus(daysRemaining);
      return {
        ...food,
        daysRemaining,
        status
      };
    });

    // 分类食物
    const normalFoods = processedList.filter(f => f.status === 'normal');
    const expiringFoods = processedList.filter(f => f.status === 'expiring');
    const expiredFoods = processedList.filter(f => f.status === 'expired');

    this.setData({
      foodList: processedList,
      normalFoods,
      expiringFoods,
      expiredFoods
    });
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/add/add'
    });
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
