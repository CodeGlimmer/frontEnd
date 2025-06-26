# WebVideoServerCard 组件使用说明

## 概述

`WebVideoServerCard` 是一个基于 Vuetify 的视频流显示卡片组件，专门用于显示来自 ROS2 `web_video_server` 的视频流。该组件提供了丰富的功能，包括连接管理、全屏显示、错误处理等。

## 功能特性

- ✅ 支持 MJPEG 视频流显示
- ✅ 自动连接和断开管理
- ✅ 全屏显示功能
- ✅ 连接状态指示
- ✅ 错误处理和重试机制
- ✅ 响应式设计
- ✅ Material Design 3 风格
- ✅ 丰富的动画效果

## 安装和使用

### 1. 启动 Web Video Server

在 ROS2 环境中运行以下命令：

```bash
ros2 run web_video_server web_video_server
```

默认情况下，服务器会在 `http://localhost:8080` 启动。

### 2. 基本使用

```vue
<template>
  <web-video-server-card
    title="摄像头视频流"
    url="http://localhost:8080/stream?topic=/camera/image_raw"
    :auto-start="true"
    @connection-change="handleConnectionChange"
    @connection-error="handleConnectionError"
  />
</template>

<script setup>
import WebVideoServerCard from '@/components/common/WebVideoServerCard.vue'

const handleConnectionChange = (status) => {
  console.log('连接状态变化:', status)
}

const handleConnectionError = (error) => {
  console.error('连接错误:', error)
}
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | String | 'Web视频流查看器' | 卡片标题 |
| `url` | String | '' | 视频流 URL |
| `autoStart` | Boolean | false | 是否自动开始连接 |
| `elevation` | Number/String | 2 | 卡片阴影级别 |
| `variant` | String | 'elevated' | 卡片变体样式 |
| `showSubtitle` | Boolean | true | 是否显示状态副标题 |
| `showMenu` | Boolean | true | 是否显示菜单按钮 |
| `showControls` | Boolean | true | 是否显示控制面板 |
| `hideOverlay` | Boolean | false | 是否隐藏覆盖层 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `connection-change` | status: string | 连接状态变化时触发 |
| `connection-error` | error: object | 连接错误时触发 |
| `status-update` | message: string | 状态消息更新时触发 |

## URL 格式说明

### 基本格式

```
http://localhost:8080/stream?topic=<topic_name>
```

### 常用参数

- `topic`: ROS 话题名称
- `type`: 流类型 (mjpeg, png, jpg)
- `quality`: 图像质量 (1-100)
- `width`: 图像宽度
- `height`: 图像高度

### 示例 URL

```bash
# 基本 MJPEG 流
http://localhost:8080/stream?topic=/camera/image_raw

# 指定质量的流
http://localhost:8080/stream?topic=/camera/image_raw&quality=80

# 指定尺寸的流
http://localhost:8080/stream?topic=/camera/image_raw&width=640&height=480

# 压缩图像流
http://localhost:8080/stream?topic=/camera/image_raw/compressed

# 静态图片 (单帧)
http://localhost:8080/snapshot?topic=/camera/image_raw
```

## 高级用法

### 多视频流显示

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" v-for="stream in videoStreams" :key="stream.id">
        <web-video-server-card
          :title="stream.title"
          :url="stream.url"
          :auto-start="stream.autoStart"
          @connection-change="(status) => updateStreamStatus(stream.id, status)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import WebVideoServerCard from '@/components/common/WebVideoServerCard.vue'

const videoStreams = ref([
  {
    id: 1,
    title: '前置摄像头',
    url: 'http://localhost:8080/stream?topic=/camera/front/image_raw',
    autoStart: true,
  },
  {
    id: 2,
    title: '后置摄像头',
    url: 'http://localhost:8080/stream?topic=/camera/rear/image_raw',
    autoStart: true,
  },
  {
    id: 3,
    title: '深度摄像头',
    url: 'http://localhost:8080/stream?topic=/camera/depth/image_raw',
    autoStart: false,
  },
])

const updateStreamStatus = (streamId, status) => {
  console.log(`视频流 ${streamId} 状态: ${status}`)
}
</script>
```

### 自定义样式

```vue
<template>
  <web-video-server-card
    title="自定义样式视频流"
    url="http://localhost:8080/stream?topic=/camera/image_raw"
    :elevation="8"
    variant="outlined"
    :show-controls="false"
    class="custom-video-card"
  />
</template>

<style scoped>
.custom-video-card {
  border: 2px solid #1976d2;
  border-radius: 20px;
}
</style>
```

## 故障排除

### 常见问题

1. **视频无法加载**
   - 检查 web_video_server 是否正在运行
   - 确认 URL 格式正确
   - 检查话题名称是否存在

2. **连接超时**
   - 检查网络连接
   - 确认服务器地址和端口正确
   - 检查防火墙设置

3. **视频质量问题**
   - 调整 quality 参数
   - 检查网络带宽
   - 考虑使用压缩格式

### 调试技巧

```vue
<template>
  <web-video-server-card
    title="调试模式"
    url="http://localhost:8080/stream?topic=/camera/image_raw"
    @connection-change="logConnectionChange"
    @connection-error="logConnectionError"
    @status-update="logStatusUpdate"
  />
</template>

<script setup>
const logConnectionChange = (status) => {
  console.log('连接状态:', status)
}

const logConnectionError = (error) => {
  console.error('连接错误:', error)
}

const logStatusUpdate = (message) => {
  console.log('状态更新:', message)
}
</script>
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. 确保 ROS2 环境正确配置
2. web_video_server 必须在运行状态
3. 网络延迟可能影响视频流质量
4. 建议在本地网络环境中使用以获得最佳性能
