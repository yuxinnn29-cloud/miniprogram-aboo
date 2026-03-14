/**
 * 获取食物列表
 * @returns {Array} 食物列表
 */
function getFoodList() {
  try {
    return wx.getStorageSync('foodList') || [];
  } catch (error) {
    console.error('获取食物列表失败:', error);
    return [];
  }
}

/**
 * 保存食物列表
 * @param {Array} foodList - 食物列表
 */
function saveFoodList(foodList) {
  try {
    wx.setStorageSync('foodList', foodList);
  } catch (error) {
    console.error('保存食物列表失败:', error);
    throw error;
  }
}

/**
 * 添加食物
 * @param {Object} food - 食物对象
 */
function addFood(food) {
  const foodList = getFoodList();
  foodList.unshift(food);
  saveFoodList(foodList);
}

/**
 * 更新食物
 * @param {string} id - 食物ID
 * @param {Object} updatedFood - 更新的食物对象
 * @returns {boolean} 是否更新成功
 */
function updateFood(id, updatedFood) {
  const foodList = getFoodList();
  const index = foodList.findIndex(food => food.id === id);
  if (index !== -1) {
    foodList[index] = { ...foodList[index], ...updatedFood };
    saveFoodList(foodList);
    return true;
  }
  return false;
}

/**
 * 删除食物
 * @param {string} id - 食物ID
 * @returns {boolean} 是否删除成功
 */
function deleteFood(id) {
  const foodList = getFoodList();
  const originalLength = foodList.length;
  const newList = foodList.filter(food => food.id !== id);
  if (newList.length < originalLength) {
    saveFoodList(newList);
    return true;
  }
  return false;
}

/**
 * 根据ID获取食物
 * @param {string} id - 食物ID
 * @returns {Object|null} 食物对象
 */
function getFoodById(id) {
  const foodList = getFoodList();
  return foodList.find(food => food.id === id) || null;
}

/**
 * 获取提醒天数设置
 * @returns {number} 提醒天数
 */
function getAlertDays() {
  try {
    return wx.getStorageSync('alertDays') || 3;
  } catch (error) {
    console.error('获取提醒天数失败:', error);
    return 3;
  }
}

/**
 * 保存提醒天数设置
 * @param {number} days - 提醒天数
 */
function saveAlertDays(days) {
  try {
    wx.setStorageSync('alertDays', days);
  } catch (error) {
    console.error('保存提醒天数失败:', error);
    throw error;
  }
}

/**
 * 获取API Key
 * @returns {string} API Key
 */
function getApiKey() {
  try {
    return wx.getStorageSync('apiKey') || '';
  } catch (error) {
    console.error('获取API Key失败:', error);
    return '';
  }
}

/**
 * 保存API Key
 * @param {string} key - API Key
 */
function saveApiKey(key) {
  try {
    wx.setStorageSync('apiKey', key);
  } catch (error) {
    console.error('保存API Key失败:', error);
    throw error;
  }
}

module.exports = {
  getFoodList,
  saveFoodList,
  addFood,
  updateFood,
  deleteFood,
  getFoodById,
  getAlertDays,
  saveAlertDays,
  getApiKey,
  saveApiKey
};
