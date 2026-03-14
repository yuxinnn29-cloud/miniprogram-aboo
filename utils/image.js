/**
 * 压缩图片
 * @param {string} filePath - 图片路径
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: filePath,
      quality: 80,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: reject
    });
  });
}

/**
 * 将图片转换为base64
 * @param {string} filePath - 图片路径
 * @returns {Promise<string>} base64字符串
 */
function imageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        resolve(res.data);
      },
      fail: reject
    });
  });
}

/**
 * 保存图片到本地
 * @param {string} tempFilePath - 临时文件路径
 * @returns {Promise<string>} 保存后的文件路径
 */
function saveImageToLocal(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: (res) => {
        resolve(res.savedFilePath);
      },
      fail: reject
    });
  });
}

/**
 * 删除本地图片
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>}
 */
function deleteLocalImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().unlink({
      filePath: filePath,
      success: resolve,
      fail: reject
    });
  });
}

module.exports = {
  compressImage,
  imageToBase64,
  saveImageToLocal,
  deleteLocalImage
};
