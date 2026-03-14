# 冰箱食物追踪小程序 - 设计文档

## 项目概述

开发一个微信小程序，用户可以通过拍照记录放入冰箱的食物，利用火山引擎大模型分析食物信息和保质期，并在保质期前通过小程序内弹窗提醒用户。

## 技术选型

- **平台**: 微信小程序
- **AI 模型**: 火山引擎豆包大模型（用户已购买 Coding Plan）
- **数据存储**: 微信小程序本地存储（wx.Storage）
- **UI 框架**: Vant Weapp 组件库
- **提醒方式**: 小程序内弹窗提醒

## 整体架构

### 架构方案：纯前端实现

```
用户操作 → 微信小程序前端 → 火山引擎 API → 本地存储
```

**优势**:
- 无需后端服务器，开发成本低
- 部署简单，只需发布小程序
- 维护成本低，无服务器运维

## 核心功能模块

### 1. 拍照识别模块
- 调用微信相机 API 拍摄食物照片
- 将照片转换为 base64 格式
- 调用火山引擎豆包大模型视觉理解 API
- 解析返回的食物信息：
  - 食物名称
  - 预估保质期（天数）
  - 存储建议（冷藏/冷冻/常温）
  - 营养信息
  - 食物分类

### 2. 食物管理模块
- 食物列表展示（按保质期排序）
- 食物状态分类：
  - 正常（剩余天数 > 3天）- 绿色标签
  - 即将过期（剩余天数 1-3天）- 橙色标签，置顶显示
  - 已过期（剩余天数 ≤ 0天）- 红色标签，半透明显示
- 食物详情查看和编辑
- 食物删除功能（二次确认）

### 3. 提醒模块
- 小程序启动时（app.onShow）检查即将过期的食物
- 弹窗提醒用户（默认提前 3 天）
- 可在设置中调整提醒时间

### 4. 设置模块
- 提醒时间设置（提前几天）
- 火山引擎 API Key 配置
- 数据导出/导入功能
- 关于信息

## 数据结构

### 食物对象
```javascript
{
  id: "uuid",                    // 唯一标识
  name: "苹果",                  // 食物名称
  photo: "本地图片路径",          // 照片存储路径
  addDate: "2026-03-14",         // 添加日期
  expiryDate: "2026-03-21",      // 过期日期
  daysRemaining: 7,              // 剩余天数（动态计算）
  storageAdvice: "冷藏保存",      // 存储建议
  nutrition: "富含维生素C",       // 营养信息
  category: "水果",              // 食物分类
  status: "normal"               // 状态: normal/expiring/expired
}
```

### 本地存储键值
- `foodList`: 食物列表数组
- `alertDays`: 提醒天数设置（默认 3）
- `apiKey`: 火山引擎 API Key

## 页面结构

### 1. 首页（食物列表）
- **顶部**: 添加按钮 + 统计信息（总数/即将过期数）
- **中间**: 食物卡片列表
  - 按状态分组显示
  - 即将过期的食物置顶
  - 使用 Vant Card 组件
- **底部**: 导航栏（首页/设置）

### 2. 添加页面
- 拍照/选择照片按钮
- 识别中的加载动画
- 识别结果展示表单（可编辑）：
  - 食物名称
  - 保质期（天数）
  - 存储建议
  - 营养信息
  - 分类
- 保存/取消按钮

### 3. 详情页面
- 食物照片展示
- 详细信息展示
- 剩余天数倒计时
- 编辑/删除按钮

### 4. 设置页面
- 提醒设置（提前几天）
- API Key 配置
- 数据导出/导入
- 清空所有数据
- 关于信息

## 技术实现细节

### 火山引擎 API 集成

```javascript
const analyzeFood = async (imageBase64) => {
  const response = await wx.request({
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'doubao-vision-pro',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          {
            type: 'text',
            text: '请识别这个食物，返回JSON格式：{name, expiryDays, storageAdvice, nutrition, category}'
          }
        ]
      }]
    }
  });
  return JSON.parse(response.data.choices[0].message.content);
};
```

### 本地存储方案

- 使用 `wx.setStorageSync()` 和 `wx.getStorageSync()` 存储食物列表
- 使用 `wx.saveFile()` 保存照片到本地文件系统
- 每次添加/删除/编辑时更新存储
- 定期清理已删除食物的图片文件

### 提醒逻辑

```javascript
// 在 app.js 的 onShow 中检查
onShow() {
  const foodList = wx.getStorageSync('foodList') || [];
  const alertDays = wx.getStorageSync('alertDays') || 3;

  const expiringFoods = foodList.filter(food => {
    const days = calculateDaysRemaining(food.expiryDate);
    return days > 0 && days <= alertDays;
  });

  if (expiringFoods.length > 0) {
    wx.showModal({
      title: '食物即将过期',
      content: `您有 ${expiringFoods.length} 件食物即将过期`,
      confirmText: '查看',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  }
}
```

## 用户体验流程

### 添加食物流程

1. 用户点击"添加食物"按钮
2. 调用 `wx.chooseMedia()` 打开相机或相册
3. 用户拍照或选择照片
4. 压缩图片并转换为 base64
5. 显示"识别中"加载动画
6. 调用火山引擎 API 分析照片
7. 展示识别结果表单（可编辑）
8. 用户确认或修改信息
9. 保存到本地存储
10. 返回首页，新食物显示在列表中

### 错误处理

1. **API 调用失败**
   - 显示友好错误提示
   - 提供"重试"按钮
   - 允许手动输入食物信息

2. **识别不准确**
   - 所有字段可编辑
   - 提供常见食物快速选择

3. **网络问题**
   - 检测网络状态
   - 离线时提示用户
   - 支持手动添加（不使用 AI）

## 项目目录结构

```
miniprogram-v1/
├── pages/
│   ├── index/              # 首页（食物列表）
│   ├── add/                # 添加食物页面
│   ├── detail/             # 食物详情页面
│   └── settings/           # 设置页面
├── utils/
│   ├── api.js              # 火山引擎 API 封装
│   ├── storage.js          # 本地存储管理
│   ├── date.js             # 日期计算工具
│   └── image.js            # 图片处理工具
├── components/
│   └── food-card/          # 食物卡片组件
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
└── project.config.json     # 项目配置
```

## 开发优先级

### 第一阶段（核心功能）
1. 搭建项目基础结构
2. 集成 Vant Weapp UI 组件库
3. 实现拍照和图片选择功能
4. 集成火山引擎 API 调用
5. 实现本地存储功能
6. 完成食物列表展示

### 第二阶段（完善功能）
1. 实现食物详情和编辑
2. 添加提醒功能
3. 实现状态管理和过期检测
4. 优化 UI 和交互体验

### 第三阶段（优化增强）
1. 添加设置页面
2. 实现数据导出/导入
3. 性能优化和错误处理
4. 用户体验细节打磨

## 关键技术点

### API Key 安全
- 使用环境变量存储
- 不提交到代码仓库
- 在设置页面允许用户配置自己的 Key

### 性能优化
- 图片压缩（限制在 1MB 以内）
- 列表虚拟滚动（食物数量多时）
- 缓存 API 响应（避免重复识别）

### 数据安全
- 定期备份提示
- 删除前二次确认
- 提供数据恢复功能

## 成功标准

1. 用户可以成功拍照并识别食物信息
2. 识别准确率达到可用水平（可手动修正）
3. 食物列表清晰展示，状态标识明确
4. 提醒功能正常工作，用户不会错过过期食物
5. 界面美观，操作流畅，符合微信小程序规范

## 未来扩展方向

1. 支持扫描条形码识别包装食品
2. 添加食谱推荐功能（基于现有食材）
3. 支持多用户家庭共享
4. 添加食物消耗统计和浪费分析
5. 接入微信订阅消息实现主动推送
