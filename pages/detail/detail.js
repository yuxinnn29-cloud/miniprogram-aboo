const { getFoodById, updateFood, deleteFood } = require('../../utils/storage');
const { calculateDaysRemaining, getFoodStatus, formatDate } = require('../../utils/date');
const { deleteLocalImage } = require('../../utils/image');
const { getAlertDays } = require('../../utils/storage');

Page({
  data: {
    id: '',
    food: null,
    daysRemaining: 0,
    status: '',
    isEditing: false,
    editName: '',
    editExpiryDate: '',
    editStorageAdvice: '',
    editNutrition: '',
    editCategory: ''
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.loadFoodDetail();
  },

  onShow() {
    this.loadFoodDetail();
  },

  loadFoodDetail() {
    const { id } = this.data;
    const food = getFoodById(id);

    if (!food) {
      wx.showToast({
        title: '食物不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    const daysRemaining = calculateDaysRemaining(food.expiryDate);
    const alertDays = getAlertDays();
    const status = getFoodStatus(daysRemaining, alertDays);

    this.setData({
      food,
      daysRemaining,
      status,
      editName: food.name,
      editExpiryDate: food.expiryDate,
      editStorageAdvice: food.storageAdvice,
      editNutrition: food.nutrition,
      editCategory: food.category
    });
  },

  toggleEdit() {
    this.setData({
      isEditing: !this.data.isEditing
    });
  },

  onNameInput(e) {
    this.setData({ editName: e.detail });
  },

  onExpiryDateInput(e) {
    this.setData({ editExpiryDate: e.detail });
  },

  onStorageAdviceInput(e) {
    this.setData({ editStorageAdvice: e.detail });
  },

  onNutritionInput(e) {
    this.setData({ editNutrition: e.detail });
  },

  onCategoryInput(e) {
    this.setData({ editCategory: e.detail });
  },

  saveEdit() {
    const { id, editName, editExpiryDate, editStorageAdvice, editNutrition, editCategory } = this.data;

    if (!editName) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      });
      return;
    }

    if (!editExpiryDate) {
      wx.showToast({
        title: '请输入过期日期',
        icon: 'none'
      });
      return;
    }

    // 验证日期格式 YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(editExpiryDate)) {
      wx.showToast({
        title: '日期格式错误，请使用 YYYY-MM-DD',
        icon: 'none'
      });
      return;
    }

    // 验证日期是否有效
    const testDate = new Date(editExpiryDate);
    if (isNaN(testDate.getTime())) {
      wx.showToast({
        title: '无效的日期',
        icon: 'none'
      });
      return;
    }

    const success = updateFood(id, {
      name: editName,
      expiryDate: editExpiryDate,
      storageAdvice: editStorageAdvice,
      nutrition: editNutrition,
      category: editCategory
    });

    if (success) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({ isEditing: false });
      this.loadFoodDetail();
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  cancelEdit() {
    const { food } = this.data;
    this.setData({
      isEditing: false,
      editName: food.name,
      editExpiryDate: food.expiryDate,
      editStorageAdvice: food.storageAdvice,
      editNutrition: food.nutrition,
      editCategory: food.category
    });
  },

  confirmDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个食物吗？',
      confirmText: '删除',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          this.handleDeleteFood();
        }
      }
    });
  },

  async handleDeleteFood() {
    const { id, food } = this.data;

    try {
      // 删除图片文件
      if (food.photo) {
        await deleteLocalImage(food.photo);
      }
    } catch (error) {
      console.error('删除图片失败:', error);
    }

    // 删除食物记录
    const success = deleteFood(id);

    if (success) {
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  }
});
