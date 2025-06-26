# DashBoard 视频显示模式使用说明

## 概述

DashBoard 现在支持两种视频显示模式，用户可以根据需要在 **ROS Bridge** 和 **Web Video Server** 之间切换。

## 功能特性

### 🔄 双模式支持
- **ROS Bridge 模式**: 通过 WebSocket 连接显示 ROS 话题视频
- **Web Video Server 模式**: 通过 HTTP 连接显示 web_video_server 视频流

### 💾 配置持久化
- 自动保存用户选择的显示模式
- 自动保存 Web Video Server URL
- 页面刷新后保持用户设置

### 🎨 无缝切换
- 平滑的模式切换动画
- 保持原有布局不变
- 响应式设计适配移动端

## 使用方法

### 1. 模式切换

在视频显示区域顶部，您会看到一个模式选择器：

```
视频显示方式: [ROS Bridge] [Web Video Server]
```

点击相应按钮即可切换模式。

### 2. ROS Bridge 模式

这是原有的显示模式，通过 ROS Bridge 连接：

1. 在顶部输入 ROS WebSocket URL (如: `ws://localhost:9090`)
2. 点击"连接"按钮
3. RosViewCard 组件会自动连接并显示视频

**适用场景:**
- 需要显示 ROS 话题数据
- 使用 rosbridge_server
- 需要双向通信功能

### 3. Web Video Server 模式

新增的显示模式，通过 HTTP 连接：

1. 确保 web_video_server 正在运行:
   ```bash
   ros2 run web_video_server web_video_server
   ```

2. 切换到 "Web Video Server" 模式

3. 在 WebVideoServerCard 的控制面板中输入视频流 URL:
   ```
   http://localhost:8080/stream?topic=/camera/image_raw
   ```

4. 点击"连接"按钮开始播放

**适用场景:**
- 只需要显示视频流
- 网络环境不稳定时更可靠
- 需要更好的视频质量
- 支持多种视频格式

## URL 格式说明

### ROS Bridge URL
```
ws://[主机地址]:[端口]
```
示例:
- `ws://localhost:9090`
- `ws://192.168.1.100:9090`

### Web Video Server URL
```
http://[主机地址]:[端口]/stream?topic=[话题名称]
```
示例:
- `http://localhost:8080/stream?topic=/camera/image_raw`
- `http://192.168.1.100:8080/stream?topic=/camera/image_raw/compressed`
- `http://localhost:8080/stream?topic=/camera/depth/image_raw&quality=80`

## 配置持久化

系统会自动保存以下配置到浏览器本地存储：

| 配置项 | 存储键 | 说明 |
|--------|--------|------|
| ROS URL | `ros_url` | ROS Bridge WebSocket 地址 |
| 视频显示模式 | `video_display_mode` | 当前选择的显示模式 |
| Web Video URL | `web_video_url` | Web Video Server 流地址 |

## 故障排除

### ROS Bridge 模式问题

1. **连接失败**
   - 检查 rosbridge_server 是否运行
   - 确认 WebSocket URL 正确
   - 检查防火墙设置

2. **视频不显示**
   - 确认话题名称正确
   - 检查话题是否有数据发布
   - 验证图像格式支持

### Web Video Server 模式问题

1. **视频加载失败**
   - 确认 web_video_server 正在运行
   - 检查 HTTP URL 格式
   - 验证话题名称存在

2. **视频质量问题**
   - 调整 quality 参数 (1-100)
   - 检查网络带宽
   - 考虑使用压缩格式

## 开发者信息

### 组件结构

```vue
<template>
  <!-- 视频显示方式选择器 -->
  <div class="video-mode-selector">
    <button @click="videoDisplayMode = 'ros'">ROS Bridge</button>
    <button @click="videoDisplayMode = 'web'">Web Video Server</button>
  </div>

  <!-- 条件渲染视频组件 -->
  <RosViewCard v-if="videoDisplayMode === 'ros'" />
  <WebVideoServerCard v-else-if="videoDisplayMode === 'web'" />
</template>
```

### 响应式变量

```javascript
const videoDisplayMode = ref('ros') // 'ros' 或 'web'
const webVideoUrl = ref('http://localhost:8080/stream?topic=/camera/image_raw')
```

### 事件处理

```javascript
// 监听模式变化并保存
watch(videoDisplayMode, (newMode) => {
  saveVideoModeToStorage(newMode)
})

// Web Video Server 事件处理
const handleWebVideoConnectionChange = (status) => {
  console.log('连接状态:', status)
}
```

## 最佳实践

1. **模式选择建议**
   - 开发调试时使用 ROS Bridge 模式
   - 生产环境或演示时使用 Web Video Server 模式
   - 网络不稳定时优先选择 Web Video Server 模式

2. **性能优化**
   - 根据网络条件调整视频质量参数
   - 避免同时运行多个高分辨率视频流
   - 定期清理浏览器缓存

3. **安全考虑**
   - 在生产环境中使用 HTTPS/WSS
   - 配置适当的访问控制
   - 定期更新 ROS 和相关组件

## 更新日志

### v1.0.0
- ✅ 添加双模式视频显示支持
- ✅ 实现配置持久化
- ✅ 优化用户界面和交互
- ✅ 添加响应式设计支持
- ✅ 完善错误处理和状态管理
