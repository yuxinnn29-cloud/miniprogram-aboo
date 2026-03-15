/**
 * 压缩图片
 * @param {string} filePath - 图片路径
 * @returns {Promise<string>} 压缩后的图片路径
 */
function compressImage(filePath) {
  return new Promise((resolve, reject) => {
    console.log('开始压缩图片:', filePath);

    wx.compressImage({
      src: filePath,
      quality: 80,
      success: (res) => {
        console.log('图片压缩成功:', res.tempFilePath);
        resolve(res.tempFilePath);
      },
      fail: (error) => {
        console.error('图片压缩失败:', error);
        reject(error);
      }
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
    console.log('开始转换图片为base64:', filePath);

    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        console.log('图片转换为base64成功');
        resolve(res.data);
      },
      fail: (error) => {
        console.error('图片转换为base64失败:', error);
        reject(error);
      }
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
      fail: (error) => {
        // 文件不存在时不视为错误
        if (error.errMsg && error.errMsg.includes('no such file')) {
          console.warn('文件不存在，无需删除:', filePath);
          resolve();
        } else {
          reject(error);
        }
      }
    });
  });
}

module.exports = {
  compressImage,
  imageToBase64,
  saveImageToLocal,
  deleteLocalImage
};
