# DeepSeek ChatAI 聊天界面

这是一个基于 Vue 3 + Vuetify 3 构建的 DeepSeek AI 聊天界面，提供完整的聊天功能和良好的用户体验。

## 功能特色

- 🤖 **DeepSeek AI 集成**: 支持最新的 DeepSeek 模型
- 💬 **流式响应**: 实时显示 AI 回复内容
- 🎨 **现代化 UI**: 基于 Vuetify 3 的美观界面
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 💾 **本地存储**: 自动保存聊天记录和配置
- 🔧 **灵活配置**: 支持多种模型和参数调整
- 📋 **消息复制**: 一键复制 AI 回复内容
- 🌙 **主题支持**: 与项目主题系统集成

## 文件结构

```
src/views/ChatAI/
├── ChatAI.vue              # 基础聊天组件
├── EnhancedChatAI.vue      # 增强版聊天组件（推荐使用）
├── DemoPage.vue            # 演示页面
├── chatService.js          # 聊天服务和工具函数
├── index.ts                # 模块导出文件
└── README.md               # 说明文档
```

## 使用方法

### 1. 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com)
2. 注册账号并登录
3. 在控制台获取 API Key

### 2. 配置 API

在左侧配置面板中：

- 输入您的 DeepSeek API Key
- 选择合适的模型（默认：deepseek-chat）
- 调整 Temperature 和 Max Tokens 参数
- 启用或禁用流式响应

### 3. 开始聊天

配置完成后，在输入框中输入消息即可开始与 AI 对话。

## 支持的模型

- **deepseek-chat**: 通用对话模型
- **deepseek-coder**: 专业编程助手
- **deepseek-reasoner**: 推理增强模型

## 参数说明

- **Temperature**: 控制回复的随机性（0-2，默认 0.7）
- **Max Tokens**: 单次回复的最大长度（100-4000，默认 2000）
- **流式响应**: 启用后实时显示 AI 回复内容

## 功能特性

### Markdown 支持

- 支持 **粗体** 和 _斜体_ 文本
- 支持 `行内代码` 和代码块
- 支持链接格式 `[文本](URL)`

### 快捷操作

- `Ctrl + Enter` 快速发送消息
- 点击复制按钮复制 AI 回复
- 清空聊天记录功能

### 本地存储

- 自动保存聊天记录
- 保存配置信息
- 页面刷新后数据不丢失

## 在项目中使用

### 导入组件

```javascript
// 方式1：导入增强版组件（推荐）
import EnhancedChatAI from '@/views/ChatAI/EnhancedChatAI.vue'

// 方式2：从 index 文件导入
import { EnhancedChatAI } from '@/views/ChatAI'

// 方式3：导入基础版组件
import ChatAI from '@/views/ChatAI/ChatAI.vue'
```

### 在模板中使用

```vue
<template>
  <enhanced-chat-a-i />
</template>

<script setup>
import EnhancedChatAI from '@/views/ChatAI/EnhancedChatAI.vue'
</script>
```

### 路由配置

已在 `src/router/index.js` 中添加路由：

```javascript
{
  path: 'chatai',
  name: 'chatai',
  components: {
    main: () => import('@/views/ChatAI/EnhancedChatAI.vue'),
  },
  meta: {
    title: 'AGV监控系统 - AI助手',
  },
}
```

访问路径：`/index/chatai`

## API 接口

### DeepSeek API 配置

```javascript
const config = {
  apiKey: 'sk-xxxxxxxxxx', // 必需
  apiUrl: 'https://api.deepseek.com/v1/chat/completions', // 默认
  model: 'deepseek-chat', // 默认
  temperature: 0.7, // 0-2
  maxTokens: 2000, // 100-4000
  enableStream: true, // 启用流式响应
}
```

### 请求格式

```javascript
{
  "model": "deepseek-chat",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": true
}
```

## 故障排除

### 常见问题

1. **API Key 无效**

   - 检查 API Key 是否正确
   - 确认账户余额充足

2. **请求失败**

   - 检查网络连接
   - 确认 API URL 正确

3. **响应慢**
   - 尝试减少 Max Tokens
   - 检查网络延迟

### 错误处理

组件内置了完善的错误处理机制：

- 网络错误提示
- API 错误详情显示
- 请求超时处理
- 中止请求功能

## 自定义配置

### 修改默认配置

编辑 `chatService.js` 中的默认配置：

```javascript
const config = ref({
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
})
```

### 添加新模型

在 `models` 数组中添加新模型：

```javascript
const models = [
  { title: 'DeepSeek Chat', value: 'deepseek-chat' },
  { title: 'DeepSeek Coder', value: 'deepseek-coder' },
  { title: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
  // 添加新模型
  { title: 'Custom Model', value: 'custom-model' },
]
```

## 依赖项

确保项目已安装以下依赖：

```json
{
  "vue": "^3.5.13",
  "vuetify": "^3.8.0-beta.0",
  "@mdi/font": "^7.4.47"
}
```

## 开发者信息

- 基于 Vue 3 Composition API
- 使用 Vuetify 3 UI 框架
- 支持 TypeScript（可选）
- 遵循现代前端开发规范

## 更新日志

- v1.0.0: 初始版本，包含基础聊天功能
- v1.1.0: 添加流式响应支持
- v1.2.0: 增强 UI 设计和用户体验
