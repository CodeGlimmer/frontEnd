# AGV 智能调度管理系统 - 前端

🚀 基于 Vue 3 + Vuetify 3 + ROS Bridge 的现代化 AGV 智能调度管理系统前端应用

**GitHub 仓库**: [https://github.com/CodeGlimmer/frontEnd](https://github.com/CodeGlimmer/frontEnd)

## 📖 项目简介

本项目是大学三年级下学期大作业的重要组成部分，旨在构建一个功能完善的 AGV（自动导引车）智能调度管理系统。该前端应用提供了直观的用户界面，用于监控和管理 AGV 设备、订单调度、路径规划等核心功能。

## ✨ 主要特性

- 🎨 **现代化 UI 设计**: 基于 Material Design 3 规范，支持明暗主题切换
- 📱 **响应式布局**: 完美适配桌面端、平板和移动设备
- 🤖 **ROS 集成**: 通过 ROS Bridge 实现与机器人系统的实时通信
- 📊 **实时监控**: AGV 状态监控、速度显示、位置追踪
- 📋 **订单管理**: 完整的订单生命周期管理
- 🗺️ **调度规划**: 智能路径规划和任务调度
- 🎬 **优雅动画**: 超级丰富的进入动画和交互效果

## 🏗️ 项目结构

```
src/
├── components/           # 可复用组件
│   ├── common/          # 通用组件
│   │   ├── RosViewer.vue        # ROS 视频查看器
│   │   └── WebVideoServerCard.vue # Web 视频服务卡片
│   └── ...
├── views/               # 页面组件
│   ├── DashBoard/       # 仪表板页面
│   │   ├── DashBoard.vue        # 主仪表板
│   │   ├── VelocityShow.vue     # 速度显示组件
│   │   ├── QuickCommands.vue    # 快速命令
│   │   └── SendingOperations.vue # 发送操作
│   ├── AgvMonitoring/   # AGV 监控页面
│   │   ├── AgvMonitoring.vue    # AGV 监控主页
│   │   ├── RosViewCard.vue      # ROS 视图卡片
│   │   ├── WebVideoServer.vue   # Web 视频服务
│   │   └── FoxGlove.vue         # FoxGlove 集成
│   ├── OrderManagement/ # 订单管理页面
│   └── SchedulingPlanning/ # 调度规划页面
├── layouts/             # 布局组件
│   └── IndexLayout.vue  # 主布局
├── stores/              # Pinia 状态管理
├── utils/               # 工具函数
├── assets/              # 静态资源
└── router/              # 路由配置
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI 组件库**: Vuetify 3 tailwindcss(少量)
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **动画库**: GSAP
- **ROS 通信**: ROS Bridge WebSocket
- **开发语言**: JavaScript/TypeScript
- **样式预处理**: SCSS

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```sh
npm install
```

### 开发环境运行

```sh
npm run dev
```

### 生产环境构建

```sh
npm run build
```

### 运行单元测试

```sh
npm run test:unit
```

### 代码检查

```sh
npm run lint
```

## 🎯 核心功能模块

### 1. 仪表板 (DashBoard)

- 实时 AGV 状态监控
- 速度和位置显示
- 快速操作命令
- 系统状态概览

### 2. AGV 监控 (AgvMonitoring)

- 实时视频流监控
- ROS 话题数据可视化
- 设备状态追踪
- 多视角监控切换

### 3. 订单管理 (OrderManagement)

- 订单创建和编辑
- 订单状态跟踪
- 历史记录查询
- 批量操作支持

### 4. 调度规划 (SchedulingPlanning)

- 路径规划算法
- 任务调度优化
- 冲突检测和解决
- 性能分析报告

## 🎨 UI 特色

### iPhone 风格动画

- 组件进入时的优雅弹性动画
- 按钮悬停时的文字显示效果
- 流畅的页面切换过渡

### Material Design 3

- 现代化的设计语言
- 一致的视觉风格
- 丰富的交互反馈

### 响应式设计

- 移动端优先的设计理念
- 自适应布局系统
- 跨设备一致体验

## 🔧 开发说明

### 推荐 IDE 配置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (请禁用 Vetur)

### 自定义配置

参考 [Vite 配置文档](https://vite.dev/config/)

### ROS 连接配置

1. 确保 ROS Bridge 服务正在运行
2. 在应用中配置正确的 WebSocket 地址
3. 检查网络连接和防火墙设置

## 📚 学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vuetify 3 组件库](https://vuetifyjs.com/)
- [ROS Bridge 协议](http://wiki.ros.org/rosbridge_suite)
- [Material Design 3](https://m3.material.io/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 致谢

本项目使用了来自 FoxGlove 仓库的组件，我们向 [BySlin](https://github.com/BySlin) 的开源贡献表示诚挚的感谢。

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**项目作者**: Code Glimmer
**项目性质**: 大学三年级下学期大作业
**GitHub**: [https://github.com/CodeGlimmer/frontEnd](https://github.com/CodeGlimmer/frontEnd)
