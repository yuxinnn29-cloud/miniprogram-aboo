/**
 * 计算剩余天数
 * @param {string} expiryDate - 过期日期 YYYY-MM-DD
 * @returns {number} 剩余天数
 */
function calculateDaysRemaining(expiryDate) {
  // 验证日期格式
  if (!expiryDate || typeof expiryDate !== 'string') {
    console.error('无效的过期日期:', expiryDate);
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);

  // 检查日期是否有效
  if (isNaN(expiry.getTime())) {
    console.error('无法解析过期日期:', expiryDate);
    return 0;
  }

  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 计算过期日期
 * @param {number} days - 保质天数
 * @returns {string} 过期日期 YYYY-MM-DD
 */
function calculateExpiryDate(days) {
  const today = new Date();
  const expiryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return formatDate(expiryDate);
}

/**
 * 获取食物状态
 * @param {number} daysRemaining - 剩余天数
 * @returns {string} 状态: normal/expiring/expired
 */
function getFoodStatus(daysRemaining) {
  if (daysRemaining <= 0) {
    return 'expired';
  } else if (daysRemaining <= 3) {
    return 'expiring';
  } else {
    return 'normal';
  }
}

module.exports = {
  calculateDaysRemaining,
  formatDate,
  calculateExpiryDate,
  getFoodStatus
};
