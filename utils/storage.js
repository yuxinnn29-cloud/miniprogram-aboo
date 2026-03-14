/**
 * 获取食物列表
 * @returns {Array} 食物列表
 */
function getFoodList() {
  return wx.getStorageSync('foodList') || [];
}

/**
 * 保存食物列表
 * @param {Array} foodList - 食物列表
 */
function saveFoodList(foodList) {
  wx.setStorageSync('foodList', foodList);
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
 */
function updateFood(id, updatedFood) {
  const foodList = getFoodList();
  const index = foodList.findIndex(food => food.id === id);
  if (index !== -1) {
    foodList[index] = { ...foodList[index], ...updatedFood };
    saveFoodList(foodList);
  }
}

/**
 * 删除食物
 * @param {string} id - 食物ID
 */
function deleteFood(id) {
  const foodList = getFoodList();
  const newList = foodList.filter(food => food.id !== id);
  saveFoodList(newList);
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
  return wx.getStorageSync('alertDays') || 3;
}

/**
 * 保存提醒天数设置
 * @param {number} days - 提醒天数
 */
function saveAlertDays(days) {
  wx.setStorageSync('alertDays', days);
}

/**
 * 获取API Key
 * @returns {string} API Key
 */
function getApiKey() {
  return wx.getStorageSync('apiKey') || '';
}

/**
 * 保存API Key
 * @param {string} key - API Key
 */
function saveApiKey(key) {
  wx.setStorageSync('apiKey', key);
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
