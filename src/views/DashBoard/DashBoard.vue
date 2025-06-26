<template>
  <v-container fluid class="dashboard-container">
    <v-row class="dashboard-grid">
      <!-- ROS URL 输入表单 -->
      <v-col cols="12" class="form-section dashboard-item" data-delay="0">
        <v-card
          class="ros-form-container"
          :class="{ collapsed: !isFormExpanded }"
          elevation="8"
          rounded="xl"
        >
          <!-- 折叠按钮 -->
          <v-card-item class="collapse-header" @click="toggleForm">
            <template v-slot:prepend>
              <v-avatar size="24" color="primary" variant="tonal" class="collapse-icon">
                <v-icon
                  size="16"
                  class="collapse-chevron"
                  :class="{ 'rotate-180': !isFormExpanded }"
                >
                  mdi-chevron-down
                </v-icon>
              </v-avatar>
            </template>

            <v-card-title class="form-title"> ROS 连接配置 </v-card-title>
          </v-card-item>

          <!-- 表单内容 -->
          <v-expand-transition>
            <v-card-text v-show="isFormExpanded" class="form-content">
              <v-row align="center" class="form-row">
                <v-col cols="auto">
                  <v-label class="form-label">ROS URL:</v-label>
                </v-col>
                <v-col>
                  <v-row no-gutters>
                    <v-col>
                      <v-text-field
                        v-model="inputUrl"
                        placeholder="请输入ROS服务器地址"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="ros-input"
                      />
                    </v-col>
                    <v-col cols="auto" class="ml-4">
                      <v-btn
                        @click="connectRos"
                        :disabled="!inputUrl.trim()"
                        color="primary"
                        variant="elevated"
                        size="large"
                        class="connect-button"
                      >
                        连接
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-expand-transition>
        </v-card>
      </v-col>

      <!-- WorkingStatus -->
      <v-col cols="12" class="status-section dashboard-item" data-delay="100">
        <WorkingStatus />
      </v-col>
    </v-row>

    <!-- 视频和速度监控行 -->
    <v-row class="video-velocity-row" no-gutters>
      <!-- 视频显示区域 -->
      <v-col cols="12" lg="7" class="video-section pr-lg-3 dashboard-item" data-delay="200">
        <v-card
          class="video-display-container"
          elevation="12"
          rounded="xl"
          border="start"
          border-color="success"
        >
          <!-- 视频显示方式选择器 -->
          <v-card-item class="video-mode-selector">
            <template v-slot:prepend>
              <v-avatar size="12" color="primary" class="pulse-indicator">
                <div class="pulse-dot"></div>
              </v-avatar>
            </template>

            <v-card-title class="mode-selector-title"> 视频显示方式 </v-card-title>

            <template v-slot:append>
              <v-btn-toggle
                v-model="videoDisplayModeIndex"
                @update:model-value="onModeToggle"
                mandatory
                variant="elevated"
                divided
                class="mode-switch-container"
              >
                <v-btn
                  :value="0"
                  size="small"
                  class="mode-button"
                  prepend-icon="mdi-router-wireless"
                >
                  ROS Bridge
                </v-btn>
                <v-btn
                  :value="1"
                  size="small"
                  class="mode-button"
                  prepend-icon="mdi-video-wireless"
                >
                  Web Video Server
                </v-btn>
              </v-btn-toggle>
            </template>
          </v-card-item>

          <!-- 视频显示区域 -->
          <v-card-text class="video-content-area">
            <div class="video-transition-container">
              <Transition name="video-fade" mode="out-in" @enter="onEnter" @leave="onLeave">
                <!-- ROS Bridge 模式 -->
                <v-card
                  v-if="videoDisplayMode === 'ros'"
                  key="ros-mode"
                  class="video-component-wrapper ros-mode-card"
                  variant="tonal"
                  color="success"
                  rounded="xl"
                >
                  <!-- 状态指示器 -->
                  <v-avatar size="32" color="success" class="status-indicator ros-indicator">
                    <v-icon color="white">mdi-check</v-icon>
                    <div class="pulse-ring"></div>
                  </v-avatar>

                  <!-- 模式标签 -->
                  <v-chip
                    color="success"
                    variant="elevated"
                    size="small"
                    class="mode-label ros-label"
                  >
                    ROS Bridge 模式
                  </v-chip>

                  <v-card-text class="video-card-content">
                    <RosViewCard class="video-component" :wsUrl="rosUrl" />
                  </v-card-text>
                </v-card>

                <!-- Web Video Server 模式 -->
                <v-card
                  v-else-if="videoDisplayMode === 'web'"
                  key="web-mode"
                  class="video-component-wrapper web-mode-card"
                  variant="tonal"
                  color="primary"
                  rounded="xl"
                >
                  <!-- 状态指示器 -->
                  <v-avatar size="32" color="primary" class="status-indicator web-indicator">
                    <v-icon color="white">mdi-eye</v-icon>
                    <div class="pulse-ring"></div>
                  </v-avatar>

                  <!-- 模式标签 -->
                  <v-chip
                    color="primary"
                    variant="elevated"
                    size="small"
                    class="mode-label web-label"
                  >
                    Web Video Server 模式
                  </v-chip>

                  <v-card-text class="video-card-content">
                    <WebVideoServerCard
                      title="Web视频流"
                      :url="webVideoUrl"
                      :auto-start="!!webVideoUrl"
                      :show-controls="true"
                      class="video-component"
                      @connection-change="handleWebVideoConnectionChange"
                      @connection-error="handleWebVideoConnectionError"
                    />
                  </v-card-text>
                </v-card>
              </Transition>
            </div>

            <!-- 加载状态指示器 -->
            <v-overlay v-model="isVideoSwitching" contained class="loading-overlay">
              <div class="loading-content">
                <v-progress-circular
                  size="64"
                  width="4"
                  color="primary"
                  indeterminate
                  class="mb-4"
                />
                <div class="loading-text">
                  <div class="loading-title">切换视频模式</div>
                  <div class="loading-subtitle">请稍候...</div>
                </div>
              </div>
            </v-overlay>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- VelocityShow -->
      <v-col cols="12" lg="5" class="velocity-section pl-lg-3 dashboard-item" data-delay="300">
        <v-card elevation="8" rounded="xl" class="velocity-card hover-card">
          <v-card-title class="velocity-title">
            <v-icon class="mr-2" color="primary">mdi-speedometer</v-icon>
            速度监控
          </v-card-title>
          <v-card-text class="velocity-card-content">
            <VelocityShow class="velocity-component" :rosbridgeUrl="rosUrl" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 操作和命令行 -->
    <v-row class="operations-commands-row">
      <!-- SendingOperations -->
      <v-col cols="12" md="3" class="operations-section dashboard-item" data-delay="400">
        <v-card elevation="8" rounded="xl" class="operations-card">
          <SendingOperations :rosUrl class="operations-component" />
        </v-card>
      </v-col>

      <!-- QuickCommands -->
      <v-col cols="12" md="9" class="commands-section dashboard-item" data-delay="500">
        <v-card rounded="xl" class="commands-card hover-card">
          <QuickCommands class="commands-component" :rosUrl />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QuickCommands from './QuickCommands.vue'
import SendingOperations from './SendingOperations.vue'
import VelocityShow from './VelocityShow.vue'
import WorkingStatus from './WorkingStatus.vue'
import RosViewCard from '../AgvMonitoring/RosViewCard.vue'
import WebVideoServerCard from '@/components/common/WebVideoServerCard.vue'

// localStorage 键名
const ROS_URL_STORAGE_KEY = 'ros_url'
const VIDEO_MODE_STORAGE_KEY = 'video_display_mode'
const WEB_VIDEO_URL_STORAGE_KEY = 'web_video_url'

// ROS URL 相关变量
const inputUrl = ref('ws://localhost:9090')
const rosUrl = ref('')
const isFormExpanded = ref(false)

// 视频显示模式相关变量
const videoDisplayMode = ref('ros') // 'ros' 或 'web'
const webVideoUrl = ref('http://localhost:8080/stream?topic=/camera/image_raw')
const isVideoSwitching = ref(false)
const videoDisplayModeIndex = ref(0) // 0: ros, 1: web

// 从 localStorage 加载配置
const loadConfigFromStorage = () => {
  try {
    // 加载 ROS URL
    const savedUrl = localStorage.getItem(ROS_URL_STORAGE_KEY)
    if (savedUrl) {
      inputUrl.value = savedUrl
      rosUrl.value = savedUrl
      console.log('从本地存储加载 ROS URL:', savedUrl)
    }

    // 加载视频显示模式
    const savedMode = localStorage.getItem(VIDEO_MODE_STORAGE_KEY)
    if (savedMode && (savedMode === 'ros' || savedMode === 'web')) {
      videoDisplayMode.value = savedMode
      console.log('从本地存储加载视频显示模式:', savedMode)
    }

    // 加载 Web Video URL
    const savedWebVideoUrl = localStorage.getItem(WEB_VIDEO_URL_STORAGE_KEY)
    if (savedWebVideoUrl) {
      webVideoUrl.value = savedWebVideoUrl
      console.log('从本地存储加载 Web Video URL:', savedWebVideoUrl)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置到 localStorage
const saveRosUrlToStorage = (url) => {
  try {
    localStorage.setItem(ROS_URL_STORAGE_KEY, url)
    console.log('ROS URL 已保存到本地存储:', url)
  } catch (error) {
    console.error('保存 ROS URL 失败:', error)
  }
}

const saveVideoModeToStorage = (mode) => {
  try {
    localStorage.setItem(VIDEO_MODE_STORAGE_KEY, mode)
    console.log('视频显示模式已保存到本地存储:', mode)
  } catch (error) {
    console.error('保存视频显示模式失败:', error)
  }
}

const saveWebVideoUrlToStorage = (url) => {
  try {
    localStorage.setItem(WEB_VIDEO_URL_STORAGE_KEY, url)
    console.log('Web Video URL 已保存到本地存储:', url)
  } catch (error) {
    console.error('保存 Web Video URL 失败:', error)
  }
}

// 切换表单展开/收起
const toggleForm = () => {
  isFormExpanded.value = !isFormExpanded.value
}

// 连接ROS的方法
const connectRos = () => {
  const url = inputUrl.value.trim()
  if (url) {
    rosUrl.value = url
    saveRosUrlToStorage(url)
    console.log('连接ROS:', url)
  }
}

// 视频模式切换方法
const onModeToggle = async (index) => {
  const mode = index === 0 ? 'ros' : 'web'
  if (mode === videoDisplayMode.value) return

  isVideoSwitching.value = true

  // 添加短暂延迟以显示加载状态
  await new Promise((resolve) => setTimeout(resolve, 300))

  videoDisplayMode.value = mode
  videoDisplayModeIndex.value = index

  // 切换完成后隐藏加载状态
  setTimeout(() => {
    isVideoSwitching.value = false
  }, 500)
}

// 过渡事件处理器
const onEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px) scale(0.95)'

  // 强制重排
  el.offsetHeight

  el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  el.style.opacity = '1'
  el.style.transform = 'translateY(0) scale(1)'
}

const onLeave = (el) => {
  el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px) scale(1.05)'
}

// Web Video Server 事件处理
const handleWebVideoConnectionChange = (status) => {
  console.log('Web Video Server 连接状态变化:', status)
}

const handleWebVideoConnectionError = (error) => {
  console.error('Web Video Server 连接错误:', error)
}

// 监听视频显示模式变化
watch(videoDisplayMode, (newMode) => {
  saveVideoModeToStorage(newMode)
})

// 监听 Web Video URL 变化
watch(webVideoUrl, (newUrl) => {
  saveWebVideoUrlToStorage(newUrl)
})

// 监听视频显示模式变化，同步索引
watch(videoDisplayMode, (newMode) => {
  videoDisplayModeIndex.value = newMode === 'ros' ? 0 : 1
})

// iPhone 风格动画
const initializeIPhoneAnimation = () => {
  // 获取所有需要动画的元素
  const dashboardItems = document.querySelectorAll('.dashboard-item')

  // 设置初始状态
  dashboardItems.forEach((item) => {
    item.style.opacity = '0'
    item.style.transform = 'scale(0.85) translateY(15px)'
    item.style.filter = 'blur(2px)'
  })

  // 依次显示元素，使用优雅的动画曲线
  dashboardItems.forEach((item, index) => {
    const delay = parseInt(item.dataset.delay) || index * 120

    setTimeout(() => {
      item.style.transition = 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      item.style.opacity = '1'
      item.style.transform = 'scale(1) translateY(0)'
      item.style.filter = 'blur(0px)'

      // 轻微的弹性效果
      setTimeout(() => {
        item.style.transform = 'scale(1.008) translateY(-0.5px)'
        setTimeout(() => {
          item.style.transform = 'scale(1) translateY(0)'
        }, 200)
      }, 400)
    }, delay + 150)
  })
}

// 组件挂载时加载存储的配置
onMounted(() => {
  loadConfigFromStorage()
  // 初始化时同步索引
  videoDisplayModeIndex.value = videoDisplayMode.value === 'ros' ? 0 : 1

  // 启动 iPhone 风格进入动画（仅执行一次）
  setTimeout(() => {
    initializeIPhoneAnimation()
  }, 200)
})
</script>

<style scoped>
/* Dashboard 容器样式 */
.dashboard-container {
  padding: 24px;
  perspective: 1000px;
}

.dashboard-grid {
  gap: 24px;
}

/* iPhone 风格动画样式 */
.dashboard-item {
  opacity: 0;
  transform: scale(0.85) translateY(15px);
  filter: blur(2px);
  transform-origin: center center;
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
}

/* 添加微妙的光泽动画 */
@keyframes subtle-glow {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
}

/* 悬停时的微妙动画 */
.dashboard-item:hover {
  transform: translateY(-1px) scale(1.005);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 防止动画期间的闪烁 */
.dashboard-item * {
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

/* 行间距调整 */
.video-velocity-row {
  margin-top: 24px;
  margin-bottom: 24px;
}

.operations-commands-row {
  margin-top: 24px;
}

/* 表单相关样式 */
.form-section {
  margin-bottom: 16px;
}

.ros-form-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ros-form-container.collapsed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ros-form-container:not(.collapsed) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.collapse-header {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.collapse-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.collapse-icon {
  transition: all 0.3s ease;
}

.collapse-chevron {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.form-content {
  transition: all 0.3s ease;
  max-height: 200px;
  opacity: 1;
}

.form-title {
  font-size: 1rem;
  font-weight: 500;
}

.form-label {
  font-weight: 500;
  white-space: nowrap;
}

.form-row {
  gap: 24px;
}

.ros-input {
  flex: 1;
}

.connect-button {
  min-width: 100px;
}

/* 状态部分样式 */
.status-section {
  margin-bottom: 24px;
}

/* 视频显示区域样式 */
.video-section {
  margin-bottom: 24px;
}

.video-display-container {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-display-container:hover {
  transform: translateY(-2px);
}

/* 视频模式选择器样式 */
.video-mode-selector {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05),
    rgba(var(--v-theme-secondary), 0.05)
  );
  backdrop-filter: blur(10px);
}

.pulse-indicator {
  position: relative;
}

.pulse-dot {
  width: 100%;
  height: 100%;
  background-color: currentColor;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.mode-selector-title {
  font-size: 1rem;
  font-weight: 600;
}

.mode-switch-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-switch-container:hover {
  transform: scale(1.02);
}

.mode-button {
  transition: all 0.3s ease;
}

/* 视频内容区域样式 */
.video-content-area {
  padding: 32px;
  background: linear-gradient(135deg, rgba(250, 251, 252, 0.2) 0%, rgba(248, 250, 252, 0.05) 100%);
  backdrop-filter: blur(1px);
}

.video-transition-container {
  position: relative;
  width: 100%;
}

.video-component-wrapper {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-component-wrapper:hover {
  transform: translateY(-2px);
}

/* ROS 模式卡片样式 */
.ros-mode-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-success), 0.03),
    rgba(var(--v-theme-success), 0.01)
  );
  border: 1px solid rgba(var(--v-theme-success), 0.08);
  backdrop-filter: blur(1px);
}

.ros-indicator {
  position: absolute;
  top: -12px;
  left: -12px;
  z-index: 20;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.ros-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
}

.ros-label {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.ros-label:hover {
  opacity: 1;
}

/* Web 模式卡片样式 */
.web-mode-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.03),
    rgba(var(--v-theme-primary), 0.01)
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  backdrop-filter: blur(1px);
}

.web-indicator {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 20;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.web-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
}

.web-label {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.web-label:hover {
  opacity: 1;
}

/* 状态指示器样式 */
.status-indicator {
  position: relative;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid currentColor;
  border-radius: 50%;
  animation: pulse-ring 3s infinite;
  opacity: 0.3;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.15;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.video-card-content {
  padding: 24px;
}

.video-component {
  width: 100%;
  transition: all 0.3s ease;
}

.video-component:hover {
  transform: scale(1.01);
}

/* 加载覆盖层样式 */
.loading-overlay {
  backdrop-filter: blur(8px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.loading-subtitle {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Vue 过渡动画 */
.video-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  filter: blur(5px);
}

.video-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
  filter: blur(5px);
}

/* 其他组件样式 */
.velocity-section,
.operations-section,
.commands-section {
  margin-bottom: 24px;
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.operations-component,
.commands-component {
  width: 100%;
  padding: 16px;
}

/* 移除 velocity-component 的默认 padding，因为我们在 velocity-card-content 中设置了 */

/* VelocityShow 组件特殊样式 */
.velocity-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.velocity-title {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.1),
    rgba(var(--v-theme-primary), 0.05)
  );
  font-weight: 600;
  font-size: 1.1rem;
  padding: 16px 24px;
}

.velocity-card-content {
  flex: 1;
  padding: 24px !important;
}

.velocity-component {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 350px;
  width: 100%;
}

/* 确保视频和速度组件在同一行 */
@media (min-width: 1280px) {
  .video-section,
  .velocity-section {
    margin-bottom: 0;
  }

  .video-velocity-row {
    align-items: stretch;
  }

  /* 大屏幕下的间距调整 */
  .video-section.pr-lg-3 {
    padding-right: 12px !important;
  }

  .velocity-section.pl-lg-3 {
    padding-left: 12px !important;
  }
}

/* 中等屏幕调整 */
@media (max-width: 1279px) {
  .video-section {
    margin-bottom: 16px;
  }

  .velocity-component {
    min-height: 280px;
  }
}

/* 响应式调整 */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-grid {
    gap: 16px;
  }

  .video-content-area {
    padding: 16px;
  }

  .form-row {
    gap: 16px;
  }

  .velocity-component,
  .operations-component,
  .commands-component {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px;
  }

  .video-content-area {
    padding: 12px;
  }

  .mode-switch-container {
    flex-direction: column;
    gap: 8px;
  }

  .mode-button {
    width: 100%;
    justify-content: center;
  }
}

.video-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  filter: blur(5px);
}

.video-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
  filter:
    bl订单概览 AGV实时监控 订单预测 更多 TOOLS General options You can set it up,
    or opt out SETTING ￼ SIGN OUT ROS 连接配置 AGV Status 充电中 电池状态 ur(5px);
}

/* 状态指示器动画 */
@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.video-component-wrapper .tw\\:animate-ping {
  animation: status-pulse 2s infinite;
}

/* 加载状态样式 */
.video-switching-overlay {
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停效果增强 */
.video-component-wrapper:hover {
  transform: translateY(-2px);
}

.video-component-wrapper:hover :deep(.tw\\:w-full) {
  transform: scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .form-content.expanded {
    max-height: 300px;
  }

  .collapse-header {
    padding: 1rem;
  }

  .form-content .tw\\:px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .form-content .tw\\:flex {
    flex-direction: column;
    gap: 1rem;
  }

  .form-label {
    text-align: center;
  }

  .video-mode-selector {
    padding: 1rem;
  }

  .video-mode-selector .tw\\:flex {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .mode-switch-container {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .mode-indicator {
    display: none;
  }

  .mode-button {
    width: 100%;
    justify-content: center;
    min-width: auto;
    padding: 0.75rem 1rem;
  }

  .video-content-area {
    padding: 1rem;
  }

  .video-component-wrapper {
    margin: 0;
  }
}
</style>
