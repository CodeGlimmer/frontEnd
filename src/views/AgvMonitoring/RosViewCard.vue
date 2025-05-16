<template>
  <v-card
    class="ros-video-card"
    :elevation="elevation"
    :variant="variant"
    :class="{
      connecting: connectionStatus === 'initializing',
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
            <v-list-item @click="resetConnection" class="menu-list-item">
              <v-list-item-title>
                <v-icon class="mr-2" size="small">mdi-refresh</v-icon>
                重新连接
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="copyCurrentSettings" class="menu-list-item">
              <v-list-item-title>
                <v-icon class="mr-2" size="small">mdi-content-copy</v-icon>
                复制连接信息
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="fullScreenToggle" class="menu-list-item">
              <v-list-item-title>
                <v-icon class="mr-2" size="small">{{
                  isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
                }}</v-icon>
                {{ isFullScreen ? '退出全屏' : '全屏查看' }}
              </v-list-item-title>
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
      <ros-video-viewer
        :ws-url="wsUrlInternal"
        :topic-name="topicNameInternal"
        :start-video="startVideoInternal"
        @connection-change="handleConnectionChange"
        @connection-error="handleConnectionError"
        @viewing-change="handleViewingChange"
        @topic-error="handleTopicError"
        @status-update="handleStatusUpdate"
      />

      <transition name="fade">
        <div v-if="!isViewing && !hideOverlay" class="video-overlay">
          <v-progress-circular
            v-if="
              connectionStatus === 'initializing' ||
              (connectionStatus === 'connected' && startVideoInternal)
            "
            indeterminate
            color="primary"
            size="64"
            class="progress-indicator"
          ></v-progress-circular>
          <v-icon
            v-else-if="connectionStatus === 'error'"
            size="64"
            color="error"
            class="status-large-icon"
            >mdi-alert-circle</v-icon
          >
          <v-icon
            v-else-if="connectionStatus === 'closed'"
            size="64"
            color="grey"
            class="status-large-icon"
            >mdi-video-off</v-icon
          >
          <span class="mt-2 overlay-message">{{ overlayMessage }}</span>
        </div>
      </transition>
    </div>

    <v-expand-transition>
      <div v-if="expanded || alwaysShowControls" class="settings-panel">
        <v-divider></v-divider>
        <v-card-text>
          <v-form @submit.prevent="applySettings" ref="form">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="wsUrlInput"
                  label="WebSocket URL"
                  hint="例如: ws://localhost:9090"
                  persistent-hint
                  :rules="[(v) => !!v || 'URL不能为空', urlFormatValidator]"
                  :error="connectionStatus === 'error'"
                  :disabled="isLoading"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-web"
                  clearable
                  class="md3-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="topicNameInput"
                  label="Topic 名称"
                  hint="例如: /camera/image_raw/compressed"
                  persistent-hint
                  :rules="[(v) => !!v || 'Topic不能为空']"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-camera"
                  clearable
                  class="md3-field"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense class="mt-1">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="presetSelection"
                  label="预设"
                  :items="presets"
                  item-title="name"
                  item-value="id"
                  :disabled="isLoading"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-bookmark-outline"
                  @update:model-value="handlePresetChange"
                  class="md3-field"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-btn-toggle
                  v-model="aspectRatio"
                  density="comfortable"
                  variant="outlined"
                  class="mr-2 md3-btn-toggle"
                >
                  <v-btn value="4:3" :disabled="isLoading" class="ratio-btn">4:3</v-btn>
                  <v-btn value="16:9" :disabled="isLoading" class="ratio-btn">16:9</v-btn>
                  <v-btn value="auto" :disabled="isLoading" class="ratio-btn">自动</v-btn>
                </v-btn-toggle>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                  <v-switch
                    v-model="autoConnect"
                    label="自动连接"
                    :disabled="isLoading"
                    hide-details
                    density="comfortable"
                    color="primary"
                    class="mr-2 md3-switch"
                  ></v-switch>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            prepend-icon="mdi-content-save-outline"
            variant="text"
            :disabled="isLoading || !hasChanges"
            @click="saveAsPreset"
            size="small"
            class="md3-btn save-btn"
          >
            保存预设
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            :disabled="isLoading"
            @click="resetForm"
            size="small"
            class="md3-btn reset-btn"
          >
            重置
          </v-btn>
          <v-btn
            :loading="isLoading"
            :disabled="!canApply"
            color="primary"
            variant="elevated"
            @click="applySettings"
            size="small"
            class="md3-btn apply-btn"
          >
            应用
          </v-btn>
        </v-card-actions>
      </div>
    </v-expand-transition>

    <v-divider v-if="!expanded && !alwaysShowControls"></v-divider>

    <v-card-actions v-if="!alwaysShowControls" class="control-actions">
      <v-tooltip location="top" text="视频控制">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="startVideoInternal ? 'mdi-pause' : 'mdi-play'"
            :disabled="connectionStatus !== 'connected'"
            @click="toggleVideo"
            variant="text"
            size="small"
            class="control-btn play-btn"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="top" text="重新连接">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-refresh"
            :loading="connectionStatus === 'initializing'"
            :disabled="isLoading"
            @click="resetConnection"
            variant="text"
            size="small"
            class="control-btn refresh-btn"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-spacer></v-spacer>

      <span class="text-caption text-medium-emphasis status-text">
        {{ isViewing ? '视频流已连接' : connectionStatusText }}
      </span>

      <v-spacer></v-spacer>

      <v-tooltip location="top" text="全屏">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
            :disabled="!isViewing"
            @click="fullScreenToggle"
            variant="text"
            size="small"
            class="control-btn fullscreen-btn"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="top" :text="expanded ? '隐藏设置' : '显示设置'">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="expanded = !expanded"
            variant="text"
            size="small"
            class="control-btn expand-btn"
          ></v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>

    <!-- 弹出对话框 -->
    <v-dialog v-model="savePresetDialog" max-width="400px" transition="dialog-transition">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">保存预设</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="presetName"
            label="预设名称"
            variant="outlined"
            density="comfortable"
            autofocus
            :rules="[(v) => !!v || '预设名称不能为空']"
            class="md3-field dialog-field"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="savePresetDialog = false"
            class="md3-btn cancel-btn"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!presetName"
            @click="confirmSavePreset"
            class="md3-btn confirm-btn"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      class="md3-snackbar"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false" class="snackbar-btn">
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import RosVideoViewer from '@/components/common/RosViewer.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'ROS视频查看器',
  },
  wsUrl: {
    type: String,
    default: '',
  },
  topicName: {
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
  defaultExpanded: {
    type: Boolean,
    default: false,
  },
  alwaysShowControls: {
    type: Boolean,
    default: false,
  },
  showSubtitle: {
    type: Boolean,
    default: true,
  },
  showMenu: {
    type: Boolean,
    default: true,
  },
  hideOverlay: {
    type: Boolean,
    default: false,
  },
  savedPresets: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:wsUrl',
  'update:topicName',
  'update:autoStart',
  'connection-change',
  'connection-error',
  'viewing-change',
  'topic-error',
  'status-update',
  'preset-save',
  'preset-load',
  'fullscreen-change',
])

// 状态
const connectionStatus = ref('initializing')
const isViewing = ref(false)
const statusMessage = ref('')
const isLoading = ref(false)
const expanded = ref(props.defaultExpanded)
const isFullScreen = ref(false)
const videoContainer = ref(null)
const form = ref(null)

// 表单数据
const wsUrlInput = ref(props.wsUrl || '')
const topicNameInput = ref(props.topicName || '')
const autoConnect = ref(props.autoStart)
const aspectRatio = ref('4:3')
const presetSelection = ref(null)
const presets = ref([{ id: null, name: '选择预设' }, ...props.savedPresets])

// 内部实际使用的状态
const wsUrlInternal = ref(props.wsUrl || '')
const topicNameInternal = ref(props.topicName || '')
const startVideoInternal = ref(props.autoStart)

// 保存预设相关
const savePresetDialog = ref(false)
const presetName = ref('')

// 提示消息
const snackbar = ref({
  show: false,
  text: '',
  color: 'info',
  timeout: 3000,
})

// 计算属性
const hasChanges = computed(() => {
  return (
    wsUrlInput.value !== wsUrlInternal.value ||
    topicNameInput.value !== topicNameInternal.value ||
    autoConnect.value !== startVideoInternal.value
  )
})

const canApply = computed(() => {
  return !!wsUrlInput.value && hasChanges.value
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'initializing':
      return '正在连接...'
    case 'connected':
      return '已连接'
    case 'error':
      return '连接错误'
    case 'closed':
      return '连接已关闭'
    default:
      return '未连接'
  }
})

const connectionStatusIcon = computed(() => {
  switch (connectionStatus.value) {
    case 'initializing':
      return 'mdi-loading mdi-spin'
    case 'connected':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'closed':
      return 'mdi-connection'
    default:
      return 'mdi-help-circle'
  }
})

const connectionStatusColor = computed(() => {
  switch (connectionStatus.value) {
    case 'initializing':
      return 'info'
    case 'connected':
      return 'success'
    case 'error':
      return 'error'
    case 'closed':
      return 'grey'
    default:
      return 'grey'
  }
})

const overlayMessage = computed(() => {
  if (connectionStatus.value === 'initializing') {
    return '正在连接...'
  } else if (connectionStatus.value === 'connected' && startVideoInternal.value) {
    return '正在等待视频流...'
  } else if (connectionStatus.value === 'error') {
    return statusMessage.value || '连接错误'
  } else if (connectionStatus.value === 'closed') {
    return '连接已关闭'
  }
  return '视频未启动'
})

// 事件处理函数
const handleConnectionChange = (status) => {
  connectionStatus.value = status
  emit('connection-change', status)
}

const handleConnectionError = (error) => {
  emit('connection-error', error)
  showSnackbar(`连接错误: ${error.message}`, 'error')
}

const handleViewingChange = (viewing) => {
  isViewing.value = viewing
  emit('viewing-change', viewing)
}

const handleTopicError = (error) => {
  emit('topic-error', error)
  showSnackbar(`Topic错误: ${error.message}`, 'error')
}

const handleStatusUpdate = (message) => {
  statusMessage.value = message
  emit('status-update', message)
}

// 方法
const applySettings = async () => {
  try {
    const validation = await form.value?.validate()

    if (!validation?.valid) {
      return
    }
  } catch (error) {
    console.warn('表单验证错误:', error)
    // 继续执行，避免因验证失败阻止应用设置
  }

  isLoading.value = true

  // 先应用URL
  wsUrlInternal.value = wsUrlInput.value
  emit('update:wsUrl', wsUrlInput.value)

  // 短暂延迟后应用topic，确保连接已建立
  setTimeout(() => {
    topicNameInternal.value = topicNameInput.value
    startVideoInternal.value = autoConnect.value

    emit('update:topicName', topicNameInput.value)
    emit('update:autoStart', autoConnect.value)

    isLoading.value = false
  }, 500)
}

const resetForm = () => {
  wsUrlInput.value = wsUrlInternal.value || ''
  topicNameInput.value = topicNameInternal.value || ''
  autoConnect.value = startVideoInternal.value
}

const toggleVideo = () => {
  startVideoInternal.value = !startVideoInternal.value
  emit('update:autoStart', startVideoInternal.value)
}

const resetConnection = () => {
  connectionStatus.value = 'initializing'
  startVideoInternal.value = false
  isViewing.value = false

  // 短暂延迟后重新连接
  setTimeout(() => {
    const originalWsUrl = wsUrlInternal.value
    wsUrlInternal.value = ''

    setTimeout(() => {
      wsUrlInternal.value = originalWsUrl || wsUrlInput.value

      // 如果设置了自动连接，在重连后启动视频
      if (autoConnect.value) {
        setTimeout(() => {
          startVideoInternal.value = true
        }, 1000)
      }
    }, 300)
  }, 300)
}

const saveAsPreset = () => {
  presetName.value = ''
  savePresetDialog.value = true
}

const confirmSavePreset = () => {
  if (!presetName.value) return

  const newPreset = {
    id: Date.now().toString(),
    name: presetName.value,
    wsUrl: wsUrlInput.value,
    topicName: topicNameInput.value,
    aspectRatio: aspectRatio.value,
    autoConnect: autoConnect.value,
  }

  // 确保数组已初始化
  if (!Array.isArray(presets.value)) {
    presets.value = []
  }

  presets.value = [
    { id: null, name: '选择预设' },
    ...presets.value.filter((p) => p.id !== null),
    newPreset,
  ]

  presetSelection.value = newPreset.id
  savePresetDialog.value = false

  emit('preset-save', newPreset)
  showSnackbar('预设已保存', 'success')
}

const handlePresetChange = (presetId) => {
  if (!presetId) return

  const preset = presets.value.find((p) => p.id === presetId)
  if (preset) {
    wsUrlInput.value = preset.wsUrl || ''
    topicNameInput.value = preset.topicName || ''
    aspectRatio.value = preset.aspectRatio || '4:3'
    autoConnect.value = preset.autoConnect

    emit('preset-load', preset)
    showSnackbar(`已加载预设: ${preset.name}`, 'info')
  }
}

const fullScreenToggle = () => {
  isFullScreen.value = !isFullScreen.value
  emit('fullscreen-change', isFullScreen.value)

  if (isFullScreen.value) {
    const elem = videoContainer.value
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

const copyCurrentSettings = () => {
  const settings = {
    wsUrl: wsUrlInternal.value,
    topicName: topicNameInternal.value,
  }

  navigator.clipboard
    .writeText(JSON.stringify(settings, null, 2))
    .then(() => {
      showSnackbar('连接信息已复制到剪贴板', 'success')
    })
    .catch(() => {
      showSnackbar('复制失败', 'error')
    })
}

const showSnackbar = (text, color = 'info', timeout = 3000) => {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout,
  }
}

const urlFormatValidator = (value) => {
  if (!value) return true
  return (
    value.startsWith('ws://') ||
    value.startsWith('wss://') ||
    '请输入有效的WebSocket URL (ws:// 或 wss://)'
  )
}

// 监听器
watch(
  () => props.wsUrl,
  (newVal) => {
    if (newVal !== wsUrlInput.value) {
      wsUrlInput.value = newVal || ''
    }
    if (newVal !== wsUrlInternal.value) {
      wsUrlInternal.value = newVal || ''
    }
  },
)

watch(
  () => props.topicName,
  (newVal) => {
    if (newVal !== topicNameInput.value) {
      topicNameInput.value = newVal || ''
    }
    if (newVal !== topicNameInternal.value) {
      topicNameInternal.value = newVal || ''
    }
  },
)

watch(
  () => props.autoStart,
  (newVal) => {
    if (newVal !== autoConnect.value) {
      autoConnect.value = newVal
    }
    if (newVal !== startVideoInternal.value) {
      startVideoInternal.value = newVal
    }
  },
)

watch(
  () => props.savedPresets,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      presets.value = [{ id: null, name: '选择预设' }, ...newVal]
    }
  },
)

watch(aspectRatio, (newVal) => {
  const container = videoContainer.value
  if (!container) return

  const canvas = container.querySelector('canvas')
  if (!canvas) return

  if (newVal === '4:3') {
    canvas.style.aspectRatio = '4/3'
  } else if (newVal === '16:9') {
    canvas.style.aspectRatio = '16/9'
  } else {
    canvas.style.aspectRatio = 'auto'
  }
})

const handleFullscreenChange = () => {
  isFullScreen.value =
    !!document.fullscreenElement ||
    !!document.webkitFullscreenElement ||
    !!document.msFullscreenElement
}

// 生命周期钩子
onMounted(() => {
  // 处理全屏变化事件
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)

  // 设置初始状态
  wsUrlInput.value = props.wsUrl || ''
  topicNameInput.value = props.topicName || ''
  wsUrlInternal.value = props.wsUrl || ''
  topicNameInternal.value = props.topicName || ''
  autoConnect.value = props.autoStart
  startVideoInternal.value = props.autoStart

  // 如果有wsUrl但状态不是connected，强制设置为initializing
  if (wsUrlInternal.value && connectionStatus.value !== 'connected') {
    connectionStatus.value = 'initializing'

    // 短暂延迟后启动连接过程
    setTimeout(() => {
      if (connectionStatus.value === 'initializing') {
        connectionStatus.value = 'connected'
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  // 移除全屏事件监听器
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
})
</script>

<style scoped>
/* MD3 Card 基础样式 */
.ros-video-card {
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
.ros-video-card.connecting {
  border: 1px solid rgba(var(--v-theme-info), 0.3);
}

.ros-video-card.error {
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

.connecting .status-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* 视频容器 */
.video-container {
  position: relative;
  width: 100%;
  max-height: 60vh;
  min-height: 240px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  margin: 0 auto;
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-surface-variant), 0.12);
}

.video-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.1, 1);
}

.video-container.fullscreen :deep(.ros-video-viewer) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container.fullscreen :deep(.video-canvas) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  transition: transform 0.3s ease-in-out;
}

/* 视频覆盖层和动画 */
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
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(var(--v-theme-on-surface), 0.7);
  z-index: 1;
  backdrop-filter: blur(2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-indicator {
  filter: drop-shadow(0 0 3px rgba(var(--v-theme-primary), 0.2));
}

.status-large-icon {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-message {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
  transition: all 0.3s ease;
}

/* 设置面板动画 */
.settings-panel {
  background-color: rgba(var(--v-theme-surface), 1);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Material Design 3 表单样式 */
.md3-field :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.md3-field :deep(.v-field__outline) {
  transition:
    color 0.3s ease,
    opacity 0.3s ease;
}

.md3-field :deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}

.md3-field :deep(.v-field__input) {
  padding: 12px 16px;
}

.md3-field :deep(.v-label) {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Material Design 3 按钮样式 */
.md3-btn {
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition:
    all 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
}

.md3-btn:hover {
  transform: translateY(-1px);
}

.md3-btn:active {
  transform: translateY(0);
}

.apply-btn {
  box-shadow: 0 2px 4px rgba(var(--v-theme-primary), 0.2);
}

.md3-btn-toggle {
  border-radius: 20px;
  overflow: hidden;
}

.ratio-btn {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 500;
}

.md3-switch :deep(.v-switch__track) {
  opacity: 0.5;
  transition:
    opacity 0.3s ease,
    background-color 0.3s ease;
}

.md3-switch:hover :deep(.v-switch__track) {
  opacity: 0.7;
}

/* 控制按钮动画 */
.control-actions {
  padding: 8px 16px;
}

.control-btn {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;
  border-radius: 50%;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

.status-text {
  transition: opacity 0.3s ease;
}

/* 对话框样式 */
.dialog-card {
  border-radius: 28px;
  overflow: hidden;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 500;
  padding: 24px 24px 0;
}

.dialog-field {
  margin: 8px 0 16px;
}

.dialog-actions {
  padding: 16px 24px 24px;
}

/* 提示消息动画 */
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

.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
  transform: translateY(30px);
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
}

/* 确保画面适应 */
:deep(.video-canvas) {
  max-width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}
</style>
