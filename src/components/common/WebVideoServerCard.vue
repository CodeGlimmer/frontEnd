<template>
  <v-card
    class="web-video-card"
    :elevation="elevation"
    :variant="variant"
    :class="{
      connecting: connectionStatus === 'connecting',
      error: connectionStatus === 'error',
      'md3-card': true,
    }"
  >
    <v-card-item>
      <v-card-title class="d-flex align-center card-title">
        <v-icon class="mr-2 status-icon" :color="connectionStatusColor">{{
          connectionStatusIcon
        }}</v-icon>
        <span class="title-text">{{ title }}</span>
        <v-spacer></v-spacer>
        <v-menu v-if="showMenu" transition="scale-transition" location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" v-bind="props" density="comfortable" class="menu-btn">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list class="menu-list">
            <v-list-item @click="toggleFullscreen" prepend-icon="mdi-fullscreen">
              <v-list-item-title>全屏显示</v-list-item-title>
            </v-list-item>
            <v-list-item @click="refreshVideo" prepend-icon="mdi-refresh">
              <v-list-item-title>刷新视频</v-list-item-title>
            </v-list-item>
            <v-list-item @click="copyUrl" prepend-icon="mdi-content-copy">
              <v-list-item-title>复制URL</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>

      <v-card-subtitle v-if="showSubtitle" class="status-subtitle">
        <span :class="{ 'text-error': connectionStatus === 'error' }">
          {{ statusMessage || connectionStatusText }}
        </span>
      </v-card-subtitle>
    </v-card-item>

    <div ref="videoContainer" class="video-container" :class="{ fullscreen: isFullScreen }">
      <!-- 视频元素 -->
      <video
        ref="videoElement"
        class="video-player"
        :src="videoUrl"
        autoplay
        muted
        playsinline
        @loadstart="handleLoadStart"
        @loadeddata="handleLoadedData"
        @error="handleVideoError"
        @canplay="handleCanPlay"
        @waiting="handleWaiting"
        @playing="handlePlaying"
      ></video>

      <!-- 加载覆盖层 -->
      <div
        v-if="!hideOverlay && (isLoading || connectionStatus === 'connecting')"
        class="video-overlay"
      >
        <v-progress-circular
          :size="48"
          :width="4"
          color="primary"
          indeterminate
          class="progress-indicator mb-4"
        ></v-progress-circular>
        <div class="overlay-message">{{ loadingMessage }}</div>
      </div>

      <!-- 错误覆盖层 -->
      <div v-if="connectionStatus === 'error'" class="video-overlay error-overlay">
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <div class="overlay-message text-error">{{ statusMessage }}</div>
        <v-btn variant="outlined" color="error" size="small" class="mt-4" @click="refreshVideo">
          重试连接
        </v-btn>
      </div>

      <!-- 全屏按钮 -->
      <v-btn
        v-if="!hideOverlay && connectionStatus === 'connected'"
        icon="mdi-fullscreen"
        size="small"
        variant="elevated"
        class="fullscreen-btn"
        @click="toggleFullscreen"
      ></v-btn>
    </div>

    <!-- 控制面板 -->
    <v-card-actions v-if="showControls" class="control-panel">
      <v-text-field
        v-model="urlInput"
        label="Web Video Server URL"
        placeholder="http://localhost:8080/stream?topic=/camera/image_raw"
        variant="outlined"
        density="compact"
        hide-details
        class="flex-grow-1 mr-2"
      ></v-text-field>
      <v-btn
        :color="isConnected ? 'error' : 'primary'"
        :variant="isConnected ? 'outlined' : 'elevated'"
        @click="toggleConnection"
        :loading="isLoading"
      >
        {{ isConnected ? '断开' : '连接' }}
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- 全屏模式提示 -->
  <v-snackbar v-model="showFullscreenTip" timeout="3000" location="top" class="md3-snackbar">
    按 ESC 键退出全屏模式
    <template v-slot:actions>
      <v-btn variant="text" @click="showFullscreenTip = false">关闭</v-btn>
    </template>
  </v-snackbar>

  <!-- 复制成功提示 -->
  <v-snackbar
    v-model="showCopySuccess"
    timeout="2000"
    location="bottom"
    color="success"
    class="md3-snackbar"
  >
    URL 已复制到剪贴板
  </v-snackbar>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// 定义props
const props = defineProps({
  title: {
    type: String,
    default: 'Web视频流查看器',
  },
  url: {
    type: String,
    default: '',
  },
  autoStart: {
    type: Boolean,
    default: false,
  },
  elevation: {
    type: [Number, String],
    default: 2,
  },
  variant: {
    type: String,
    default: 'elevated',
  },
  showSubtitle: {
    type: Boolean,
    default: true,
  },
  showMenu: {
    type: Boolean,
    default: true,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
  hideOverlay: {
    type: Boolean,
    default: false,
  },
})

// 定义emits
const emit = defineEmits(['connection-change', 'connection-error', 'status-update'])

// 响应式引用
const videoElement = ref(null)
const videoContainer = ref(null)
const connectionStatus = ref('disconnected')
const isLoading = ref(false)
const isFullScreen = ref(false)
const statusMessage = ref('')
const loadingMessage = ref('正在连接视频流...')
const showFullscreenTip = ref(false)
const showCopySuccess = ref(false)

// 表单数据
const urlInput = ref(props.url || '')

// 计算属性
const videoUrl = computed(() => {
  return connectionStatus.value === 'connected' ? urlInput.value : ''
})

const isConnected = computed(() => {
  return connectionStatus.value === 'connected'
})

const connectionStatusColor = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'success'
    case 'connecting':
      return 'info'
    case 'error':
      return 'error'
    default:
      return 'grey'
  }
})

const connectionStatusIcon = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'mdi-check-circle'
    case 'connecting':
      return 'mdi-loading mdi-spin'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return 'mdi-circle-outline'
  }
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '视频流已连接'
    case 'connecting':
      return '正在连接视频流...'
    case 'error':
      return '连接失败'
    default:
      return '未连接'
  }
})

// 方法
const updateStatusMessage = (message) => {
  statusMessage.value = message
  emit('status-update', message)
}

const toggleConnection = () => {
  if (isConnected.value) {
    disconnectVideo()
  } else {
    connectVideo()
  }
}

const connectVideo = () => {
  if (!urlInput.value) {
    updateStatusMessage('请输入有效的视频流URL')
    connectionStatus.value = 'error'
    emit('connection-error', { type: 'invalid_url', message: '请输入有效的视频流URL' })
    return
  }

  connectionStatus.value = 'connecting'
  isLoading.value = true
  loadingMessage.value = '正在连接视频流...'

  // 设置视频源会触发相应的事件处理器
  if (videoElement.value) {
    videoElement.value.src = urlInput.value
  }
}

const disconnectVideo = () => {
  connectionStatus.value = 'disconnected'
  isLoading.value = false

  if (videoElement.value) {
    videoElement.value.src = ''
    videoElement.value.load()
  }

  updateStatusMessage('已断开连接')
  emit('connection-change', 'disconnected')
}

const refreshVideo = () => {
  if (urlInput.value) {
    connectVideo()
  }
}

// 视频事件处理器
const handleLoadStart = () => {
  connectionStatus.value = 'connecting'
  isLoading.value = true
  loadingMessage.value = '正在加载视频...'
}

const handleLoadedData = () => {
  loadingMessage.value = '视频已加载，准备播放...'
}

const handleCanPlay = () => {
  connectionStatus.value = 'connected'
  isLoading.value = false
  updateStatusMessage('视频流连接成功')
  emit('connection-change', 'connected')
}

const handleWaiting = () => {
  isLoading.value = true
  loadingMessage.value = '缓冲中...'
}

const handlePlaying = () => {
  isLoading.value = false
}

const handleVideoError = (event) => {
  connectionStatus.value = 'error'
  isLoading.value = false

  const error = event.target.error
  let errorMessage = '视频加载失败'

  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = '视频加载被中止'
        break
      case error.MEDIA_ERR_NETWORK:
        errorMessage = '网络错误，无法加载视频'
        break
      case error.MEDIA_ERR_DECODE:
        errorMessage = '视频解码错误'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = '不支持的视频格式或URL'
        break
    }
  }

  updateStatusMessage(errorMessage)
  emit('connection-error', { type: 'video_error', message: errorMessage })
}

// 全屏功能
const toggleFullscreen = () => {
  if (!isFullScreen.value) {
    enterFullscreen()
  } else {
    exitFullscreen()
  }
}

const enterFullscreen = () => {
  const container = videoContainer.value
  if (container) {
    if (container.requestFullscreen) {
      container.requestFullscreen()
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen()
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen()
    }
    showFullscreenTip.value = true
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullScreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  )
}

// 复制URL功能
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(urlInput.value)
    showCopySuccess.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 监听器
watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      urlInput.value = newUrl
      if (props.autoStart) {
        connectVideo()
      }
    }
  },
)

// 生命周期
onMounted(() => {
  // 添加全屏事件监听器
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)

  // 自动连接
  if (props.url) {
    urlInput.value = props.url
    if (props.autoStart) {
      connectVideo()
    }
  }
})

onBeforeUnmount(() => {
  // 移除全屏事件监听器
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)

  // 断开连接
  disconnectVideo()
})
</script>

<style scoped>
/* MD3 Card 基础样式 */
.web-video-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--v-shadow-elevation-2);
}

.md3-card {
  position: relative;
  overflow: hidden;
}

.md3-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    background-color 0.3s ease;
  z-index: 0;
  opacity: 0;
}

.md3-card:hover::before {
  opacity: 0.05;
  background-color: currentColor;
}

/* 连接状态相关样式 */
.web-video-card.connecting {
  border: 1px solid rgba(var(--v-theme-info), 0.3);
}

.web-video-card.error {
  border: 1px solid rgba(var(--v-theme-error), 0.3);
}

/* 标题和状态图标 */
.card-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
}

.status-icon {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-subtitle {
  transition:
    opacity 0.3s ease,
    color 0.3s ease;
}

.menu-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.menu-btn:hover {
  opacity: 1;
}

.menu-list {
  border-radius: 12px;
  box-shadow: var(--v-shadow-elevation-8);
}

/* 视频容器 */
.video-container {
  position: relative;
  width: 100%;
  min-height: 240px;
  max-height: 480px;
  background-color: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #000;
  max-height: none;
}

/* 视频播放器 */
.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.video-container.fullscreen .video-player {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

/* 视频覆盖层 */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 2;
  backdrop-filter: blur(2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-overlay {
  background-color: rgba(var(--v-theme-error), 0.1);
}

.progress-indicator {
  filter: drop-shadow(0 0 3px rgba(var(--v-theme-primary), 0.2));
}

.overlay-message {
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 全屏按钮 */
.fullscreen-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.fullscreen-btn:hover {
  opacity: 1;
}

.video-container.fullscreen .fullscreen-btn {
  top: 24px;
  right: 24px;
}

/* 控制面板 */
.control-panel {
  padding: 16px;
  background-color: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(8px);
}

/* 提示消息样式 */
.md3-snackbar {
  border-radius: 8px !important;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .video-container {
    min-height: 180px;
    max-height: 50vh;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .overlay-message {
    font-size: 0.875rem;
  }

  .control-panel {
    padding: 12px;
  }
}

/* 确保视频适应容器 */
@media (orientation: landscape) {
  .video-container.fullscreen .video-player {
    width: 100%;
    height: auto;
  }
}

@media (orientation: portrait) {
  .video-container.fullscreen .video-player {
    width: auto;
    height: 100%;
  }
}
</style>
