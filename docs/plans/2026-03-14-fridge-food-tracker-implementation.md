# 冰箱食物追踪小程序 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a WeChat mini-program that tracks refrigerator food with AI-powered expiry detection and reminders.

**Architecture:** Pure frontend WeChat mini-program using Vant Weapp UI, Volcano Engine Doubao AI for image recognition, and local storage for data persistence.

**Tech Stack:** WeChat Mini Program, Vant Weapp, Volcano Engine Doubao API, wx.Storage

---

## Task 1: Project Initialization

**Files:**
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `project.config.json`
- Create: `.gitignore`

**Step 1: Create project configuration**

Create `project.config.json`:

```json
{
  "description": "冰箱食物追踪小程序",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": true,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "libVersion": "3.0.0",
  "appid": "touristappid",
  "projectname": "fridge-food-tracker",
  "condition": {}
}
```

**Step 2: Create app.json configuration**

Create `app.json`:

```json
{
  "pages": [
    "pages/index/index",
    "pages/add/add",
    "pages/detail/detail",
    "pages/settings/settings"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "冰箱食物管理",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/settings/settings",
        "iconPath": "images/settings.png",
        "selectedIconPath": "images/settings-active.png",
        "text": "设置"
      }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

**Step 3: Create app.js entry file**

Create `app.js`:

```javascript
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
```

**Step 4: Create global styles**

Create `app.wxss`:

```css
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.container {
  padding: 20rpx;
}
```

**Step 5: Create .gitignore**

Create `.gitignore`:

```
node_modules/
miniprogram_npm/
.DS_Store
project.private.config.json
```

**Step 6: Commit project initialization**

```bash
git add .
git commit -m "feat: initialize WeChat mini-program project structure"
```

---

## Task 2: Install and Configure Vant Weapp

**Files:**
- Create: `package.json`
- Modify: `app.json`

**Step 1: Create package.json**

Create `package.json`:

```json
{
  "name": "fridge-food-tracker",
  "version": "1.0.0",
  "description": "冰箱食物追踪小程序",
  "main": "app.js",
  "scripts": {},
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@vant/weapp": "^1.11.6"
  }
}
```

**Step 2: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully

**Step 3: Build npm packages**

In WeChat DevTools: Tools -> Build npm
Expected: Build successful

**Step 4: Update app.json to use npm**

Modify `app.json` to add usingComponents:

```json
{
  "pages": [
    "pages/index/index",
    "pages/add/add",
    "pages/detail/detail",
    "pages/settings/settings"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "冰箱食物管理",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/settings/settings",
        "text": "设置"
      }
    ]
  },
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-card": "@vant/weapp/card/index",
    "van-tag": "@vant/weapp/tag/index",
    "van-dialog": "@vant/weapp/dialog/index",
    "van-toast": "@vant/weapp/toast/index",
    "van-loading": "@vant/weapp/loading/index",
    "van-field": "@vant/weapp/field/index",
    "van-cell": "@vant/weapp/cell/index",
    "van-cell-group": "@vant/weapp/cell-group/index",
    "van-stepper": "@vant/weapp/stepper/index"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

**Step 5: Commit Vant Weapp setup**

```bash
git add package.json app.json
git commit -m "feat: add Vant Weapp UI library"
```

---

## Task 3: Create Utility Functions

**Files:**
- Create: `utils/date.js`
- Create: `utils/storage.js`
- Create: `utils/image.js`
- Create: `utils/api.js`

**Step 1: Create date utility**

Create `utils/date.js`:

```javascript
/**
 * 计算剩余天数
 * @param {string} expiryDate - 过期日期 YYYY-MM-DD
 * @returns {number} 剩余天数
 */
function calculateDaysRemaining(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
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
```

**Step 2: Create storage utility**

Create `utils/storage.js`:

```javascript
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
```

**Step 3: Create image utility**

Create `utils/image.js`:

```javascript
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
```

**Step 4: Create API utility**

Create `utils/api.js`:

```javascript
const { getApiKey } = require('./storage');

/**
 * 调用火山引擎API分析食物
 * @param {string} imageBase64 - 图片base64字符串
 * @returns {Promise<Object>} 食物信息
 */
function analyzeFood(imageBase64) {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      reject(new Error('请先在设置中配置API Key'));
      return;
    }

    wx.request({
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'doubao-vision-pro',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: '请识别这个食物，返回JSON格式：{"name": "食物名称", "expiryDays": 保质天数(数字), "storageAdvice": "存储建议", "nutrition": "营养信息", "category": "食物分类"}。只返回JSON，不要其他文字。'
            }
          ]
        }]
      },
      success: (res) => {
        try {
          if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
            const content = res.data.choices[0].message.content;
            // 尝试提取JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const foodInfo = JSON.parse(jsonMatch[0]);
              resolve(foodInfo);
            } else {
              reject(new Error('无法解析AI返回的数据'));
            }
          } else {
            reject(new Error('API调用失败'));
          }
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      },
      fail: (error) => {
        reject(new Error('网络请求失败: ' + error.errMsg));
      }
    });
  });
}

module.exports = {
  analyzeFood
};
```

**Step 5: Commit utility functions**

```bash
git add utils/
git commit -m "feat: add utility functions for date, storage, image, and API"
```

---

## Task 4: Create Detail and Settings Pages

**Files:**
- Create: `pages/detail/detail.js`
- Create: `pages/detail/detail.wxml`
- Create: `pages/detail/detail.wxss`
- Create: `pages/detail/detail.json`
- Create: `pages/settings/settings.js`
- Create: `pages/settings/settings.wxml`
- Create: `pages/settings/settings.wxss`
- Create: `pages/settings/settings.json`

**Step 1: Create detail page files**

See full implementation in design document.

**Step 2: Create settings page files**

See full implementation in design document.

**Step 3: Commit pages**

```bash
git add pages/detail/ pages/settings/
git commit -m "feat: add detail and settings pages"
```

---

## Execution Options

Plan complete and saved to `docs/plans/2026-03-14-fridge-food-tracker-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
