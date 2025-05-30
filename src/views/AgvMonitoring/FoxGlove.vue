<template>
  <div class="main-viewer" :class="{ 'dark-mode': isDarkMode }">
    <a-layout class="tw:gap-2">
      <a-layout-sider
        :width="350"
        class="layout-sider tw:rounded-xl tw:!shadow-m-elevation-8 tw:hover:!shadow-m-elevation-12"
        :class="{ 'dark-sider': isDarkMode }"
      >
        <div class="sider-content tw:rounded-xl" :class="{ 'dark-sider-content': isDarkMode }">
          <a-collapse
            :default-active-key="['GlobalOptions', 'ConnectionSettings']"
            :class="{ 'dark-collapse': isDarkMode }"
          >
            <a-collapse-item
              header="连接设置"
              key="ConnectionSettings"
              :class="{ 'dark-collapse-item': isDarkMode }"
            >
              <div class="connection-settings" :class="{ 'dark-connection-settings': isDarkMode }">
                <a-input v-model="wsHost" placeholder="WebSocket主机" :disabled="isConnected">
                  <template #prepend>ws://</template>
                </a-input>
                <a-input-number
                  v-model="wsPort"
                  placeholder="端口"
                  :min="1"
                  :max="65535"
                  :disabled="isConnected"
                />
                <a-button
                  type="primary"
                  @click="toggleConnection"
                  :status="isConnected ? 'success' : 'normal'"
                >
                  {{ isConnected ? '断开连接' : '连接' }}
                </a-button>
              </div>
            </a-collapse-item>
            <GlobalOptions :fixed-frames="fixedFrames" v-model="rvizOptions.globalOptions" />
            <template v-for="(item, index) in rvizOptions.items" :key="item.name">
              <component
                :is="OptionComponents[item.type]"
                v-model="item.options"
                v-model:show="item.show"
                :fixed-frame="rvizOptions.globalOptions.fixedFrame"
                :fixed-frames="fixedFrames"
                :tf-tree="tfTree"
                :topics="topics"
                :name="item.name"
                :index="index"
              />
            </template>
          </a-collapse>
        </div>
      </a-layout-sider>
      <a-layout-content
        class="tw:rounded-xl tw:!shadow-m-elevation-8 tw:hover:!shadow-m-elevation-12"
      >
        <Viewer
          v-if="isConnected"
          :debug="true"
          :url="wsServer"
          :reconnect-time="3000"
          :click-topic="clickTopic"
          :camera-type="cameraType"
          :fixed-frame="rvizOptions.globalOptions.fixedFrame"
          :background="rvizOptions.globalOptions.background"
          @fixed-frames="setFixedFrames"
          @tf-tree-updated="setTFTree"
          @support-view-topics="setSupportViewTopics"
          ref="viewerRef"
        >
          <template v-for="(item, index) in rvizOptions.items" :key="item.name">
            <template v-if="item.show">
              <component :is="ViewerComponents[item.type]" :key="index" :options="item.options" />
            </template>
          </template>
        </Viewer>
        <div
          v-else
          class="connection-placeholder"
          :class="{ 'dark-connection-placeholder': isDarkMode }"
        >
          <div>请设置WebSocket连接并点击"连接"按钮</div>
        </div>
        <div class="controls" :class="{ 'dark-controls': isDarkMode }">
          <a-button @click="switchCameraType" size="mini" v-if="isConnected">
            {{ cameraType }}
          </a-button>
          <a-dropdown-button
            v-if="isConnected"
            style="margin-top: 10px"
            size="mini"
            @click="startClickPose"
          >
            <ArrowUpRight />
            <template #content>
              <a-doption
                v-for="item in clickTopics"
                :key="item.topic"
                @click="() => setClickTopic(item)"
                class="click-topic"
                :class="{ active: clickTopic?.topic === item.topic }"
              >
                <div>
                  {{ item.topic }}
                </div>
              </a-doption>
            </template>
          </a-dropdown-button>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
  <div class="image" ref="imageRef"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useThemeStore } from '@/stores'
import { ArrowUpRight, Sun, Moon } from 'lucide-vue-next'
import { OptionComponents } from '@/views/FoxGlove'
import { Channel, Viewer, ViewerComponents } from '@byslin/web_rviz'
import GlobalOptions from '@/views/FoxGlove/GlobalOptions.vue'
import '@arco-design/web-vue/dist/arco.css'

type TFTreeNode = {
  key: string
  title: string
  value: string
  children: TFTreeNode[]
}

const imageRef = ref<HTMLDivElement>(null)
const viewerRef = ref<{ startClick: (type: 'pose' | 'point') => void } | undefined>(undefined)

// 主题状态管理 - 修复响应性问题
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// WebSocket连接设置
const wsHost = ref(location.hostname)
const wsPort = ref(8765)
const isConnected = ref(false)
const wsServer = ref(`ws://${wsHost.value}:${wsPort.value}`)

const cameraType = ref<'2D' | '3D'>('3D')
const fixedFrames = ref<string[]>([])
const tfTree = ref<TFTreeNode[]>([])
const topics = ref<Record<string, Channel>>({})
const clickTopics = ref<Channel[]>([])
const clickTopic = ref<Channel | undefined>(undefined)
const rvizOptions = ref<{
  globalOptions: {
    fixedFrame: string
    background: string
  }
  items: {
    type: string
    name: string
    show: boolean
    options: any
  }[]
}>({
  globalOptions: {
    fixedFrame: 'map',
    background: isDarkMode.value ? '#212121' : '#303030',
  },
  items: [
    {
      type: 'Grid',
      name: 'Grid',
      show: true,
      options: {
        color: '#248EFF',
        cellSize: 1,
        numCells: 10,
      },
    },
    {
      type: 'URDF',
      name: 'URDF',
      show: true,
      options: {},
    },
    {
      type: 'TF',
      name: 'TF',
      show: true,
      options: {
        lineColor: '#FF0000',
        showLines: true,
        showLabels: true,
        frameVisible: {},
      },
    },
    {
      type: 'Axes',
      name: 'Axes',
      show: false,
      options: {
        lineType: 'full',
      },
    },
  ],
})

const switchCameraType = () => {
  cameraType.value = cameraType.value === '2D' ? '3D' : '2D'
}

const setClickTopic = (topic: Channel) => {
  clickTopic.value = topic
}

const startClickPose = () => {
  if (clickTopic.value === undefined) {
    alert('请先选择一个主题')
  } else {
    if (viewerRef.value) {
      const split = clickTopic.value.schemaName.split('/')
      const type = split[split.length - 1]
      if (type === 'PointStamped') {
        viewerRef.value.startClick('point')
      } else {
        viewerRef.value.startClick('pose')
      }
    }
  }
}

const setFixedFrames = (data: string[]) => {
  fixedFrames.value = data
}

const setTFTree = (data: TFTreeNode[]) => {
  tfTree.value = data
}

const setSupportViewTopics = (data: Record<string, Channel>) => {
  topics.value = data
  clickTopics.value = []
  for (const item of Object.values(data)) {
    const split = item.schemaName.split('/')
    const type = split[split.length - 1]
    const defaultOptions = getDefaultOptions(type)
    if (type === 'PointStamped') {
      clickTopics.value.push(item)
    } else if (type === 'PoseStamped') {
      clickTopics.value.push(item)
    } else if (type === 'PoseWithCovarianceStamped') {
      clickTopics.value.push(item)
    }
    const index = rvizOptions.value.items.findIndex((v) => v.name === item.topic)
    if (index === -1) {
      rvizOptions.value.items.push({
        name: item.topic,
        options: {
          topic: item.topic,
          ...defaultOptions,
        },
        show: false,
        type,
      })
    }
  }
}

const toggleConnection = () => {
  if (isConnected.value) {
    // 断开连接
    isConnected.value = false
    // 清空数据
    fixedFrames.value = []
    tfTree.value = []
    topics.value = {}
    clickTopics.value = []
    clickTopic.value = undefined
  } else {
    // 建立新连接
    wsServer.value = `ws://${wsHost.value}:${wsPort.value}`
    isConnected.value = true
  }
}

/**
 * 生成明亮饱和的随机颜色
 */
const getRandomVibrantHexColor = (): string => {
  const r = Math.floor(Math.random() * 256) // 红色通道
  const g = Math.floor(Math.random() * 256) // 绿色通道
  const b = Math.floor(Math.random() * 256) // 蓝色通道

  // 让颜色更加明亮和饱和
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 200 || max - min < 50) {
    return getRandomVibrantHexColor() // 递归调用直到颜色明亮且饱和
  }

  // 将每个通道的值转换为两位的十六进制字符串
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const getDefaultOptions = (type: string) => {
  if (type === 'MarkerArray') {
    return {}
  } else if (type === 'Image') {
    return {
      renderDom: imageRef.value,
    }
  } else if (type === 'LaserScan') {
    return {
      color: '#FF0000',
      size: 1,
    }
  } else if (type === 'PointCloud2') {
    return {
      size: 1,
      decayTime: 0,
      max_point_count: 0,
      colorType: 'FlatColor',
      color: '#FF0000',
    }
  } else if (type === 'OccupancyGrid') {
    return {
      type: 'map',
      opacity: 0.7,
    }
  } else if (type === 'Path') {
    return {
      color: getRandomVibrantHexColor(),
      offsetZ: 0.1,
      linewidth: 2,
    }
  } else if (type === 'PointStamped') {
    return {
      color: getRandomVibrantHexColor(),
      offsetZ: 0,
      radius: 0.2,
    }
  } else if (type === 'PolygonStamped') {
    return {
      color: getRandomVibrantHexColor(),
    }
  } else if (type === 'PoseStamped') {
    return {
      color: getRandomVibrantHexColor(),
    }
  } else if (type === 'PoseArray') {
    return {
      color: getRandomVibrantHexColor(),
      length: 1.0,
    }
  } else if (type === 'PoseWithCovarianceStamped') {
    return {
      color: getRandomVibrantHexColor(),
    }
  } else if (type === 'Octomap') {
    return {
      opacity: 1.0,
      colorMode: 'zAxisColor',
      voxelRenderMode: 'occupied',
    }
  }
}

// 监听主题变化，自动调整背景色 - 修复响应性
watch(
  isDarkMode,
  (newValue) => {
    rvizOptions.value.globalOptions.background = newValue ? '#212121' : '#303030'
  },
  { immediate: true },
)
</script>

<style lang="less" scoped>
.main-viewer {
  width: 100%;
  height: 100%;
}

.main-viewer :deep(.arco-layout) {
  width: 100%;
  height: 100%;
}

/* 侧边栏样式 */
.layout-sider {
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dark-sider {
  background-color: #1f2937;
  border-right: 1px solid #374151;
}

.sider-content {
  height: 100%;
  overflow-y: auto;
  user-select: none;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.dark-sider-content {
  background-color: #1f2937;
  color: #f9fafb;
}

.sider-content :deep(.arco-collapse-item-header-title) {
  word-wrap: break-word;
  flex-wrap: wrap;
  width: 260px;
}

/* 折叠面板样式 - 亮色模式 */
:deep(.arco-collapse-item) {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.arco-collapse-item-header) {
  background-color: #ffffff;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.arco-collapse-item-header:hover) {
  background-color: #f9fafb;
}

:deep(.arco-collapse-item-content) {
  background-color: #ffffff;
  color: #374151;
  transition: all 0.3s ease;
}

/* 表单样式 - 亮色模式 */
:deep(.arco-form-item-label) {
  color: #374151;
  transition: color 0.3s ease;
}

:deep(.arco-input-wrapper) {
  background-color: #ffffff;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-input) {
  background-color: #ffffff;
  color: #374151;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-input:hover) {
  border-color: #9ca3af;
}

:deep(.arco-input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.arco-input-number) {
  background-color: #ffffff;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-input-number .arco-input) {
  background-color: transparent;
}

:deep(.arco-select-view-single) {
  background-color: #ffffff;
  border-color: #d1d5db;
  color: #374151;
  transition: all 0.3s ease;
}

:deep(.arco-select-view-single:hover) {
  border-color: #9ca3af;
}

:deep(.arco-select-view-single:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.arco-btn-text) {
  color: #374151;
  transition: all 0.3s ease;
}

:deep(.arco-btn-text:hover) {
  background-color: #f3f4f6;
}

/* 折叠面板暗色模式 */
.dark-collapse :deep(.arco-collapse-item) {
  background-color: #1f2937;
  border-bottom: 1px solid #374151;
}

.dark-collapse :deep(.arco-collapse-item-header) {
  background-color: #1f2937;
  color: #f9fafb;
  border-bottom: 1px solid #374151;
}

.dark-collapse :deep(.arco-collapse-item-header:hover) {
  background-color: #374151;
}

.dark-collapse :deep(.arco-collapse-item-content) {
  background-color: #1f2937;
  color: #f9fafb;
}

/* 表单暗色模式 */
.dark-collapse :deep(.arco-form-item-label) {
  color: #f9fafb;
}

.dark-collapse :deep(.arco-input-wrapper) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-collapse :deep(.arco-input) {
  background-color: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

.dark-collapse :deep(.arco-input:hover) {
  border-color: #6b7280;
}

.dark-collapse :deep(.arco-input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.dark-collapse :deep(.arco-input-number) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-collapse :deep(.arco-input-number .arco-input) {
  background-color: transparent;
}

.dark-collapse :deep(.arco-select-view-single) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-collapse :deep(.arco-select-view-single:hover) {
  border-color: #6b7280;
}

.dark-collapse :deep(.arco-select-view-single:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.dark-collapse :deep(.arco-switch) {
  background-color: #4b5563;
}

.dark-collapse :deep(.arco-switch-checked) {
  background-color: #3b82f6;
}

.dark-collapse :deep(.arco-btn-text) {
  color: #f9fafb;
}

.dark-collapse :deep(.arco-btn-text:hover) {
  background-color: #374151;
}

/* 连接设置样式 */
.connection-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .arco-input-wrapper {
    width: 100%;
  }

  .arco-input-number {
    width: 100%;
  }
}

/* 连接设置亮色模式 */
.connection-settings :deep(.arco-input-group-prepend) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
  transition: all 0.3s ease;
}

.connection-settings :deep(.arco-btn-primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  transition: all 0.3s ease;
}

.connection-settings :deep(.arco-btn-primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.connection-settings :deep(.arco-btn-status-success) {
  background-color: #10b981;
  border-color: #10b981;
}

/* 连接设置暗色模式 */
.dark-connection-settings :deep(.arco-input-group-prepend) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-connection-settings :deep(.arco-btn-primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.dark-connection-settings :deep(.arco-btn-primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.dark-connection-settings :deep(.arco-btn-status-success) {
  background-color: #10b981;
  border-color: #10b981;
}

.theme-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}

/* 控制按钮样式 */
.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

/* 控制按钮亮色模式 */
.controls :deep(.arco-btn-mini) {
  background-color: #ffffff;
  border-color: #d1d5db;
  color: #374151;
  transition: all 0.3s ease;
}

.controls :deep(.arco-btn-mini:hover) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.controls :deep(.arco-dropdown-button) {
  background-color: #ffffff;
  border-color: #d1d5db;
  color: #374151;
  transition: all 0.3s ease;
}

.controls :deep(.arco-dropdown-button:hover) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* 控制按钮暗色模式 */
.dark-controls :deep(.arco-btn-mini) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-controls :deep(.arco-btn-mini:hover) {
  background-color: #4b5563;
  border-color: #6b7280;
}

.dark-controls :deep(.arco-dropdown-button) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-controls :deep(.arco-dropdown-button:hover) {
  background-color: #4b5563;
  border-color: #6b7280;
}

.click-topic.active {
  background: #3b82f6;
  color: #ffffff;
}

.image {
  position: absolute;
  top: 80px;
  right: 10px;
  display: flex;
  width: 320px;

  :deep(video) {
    width: 100%;
    aspect-ratio: auto;
    object-fit: cover;
    margin-top: 10px;
    flex: 1;
  }

  :deep(video):first-child {
    margin-top: 0;
  }
}

.connection-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--color-fill-2, #f5f5f5);
  color: var(--color-text-2, #666);
  font-size: 16px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.dark-connection-placeholder {
  background-color: #1f2937;
  color: #d1d5db;
}

/* 下拉菜单样式 - 亮色模式 */
:deep(.arco-dropdown-list) {
  background-color: #ffffff;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-dropdown-option) {
  color: #374151;
  transition: all 0.3s ease;
}

:deep(.arco-dropdown-option:hover) {
  background-color: #f3f4f6;
}

/* 颜色选择器样式 - 亮色模式 */
:deep(.arco-color-picker-trigger) {
  background-color: #ffffff;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-color-picker-panel) {
  background-color: #ffffff;
  border-color: #d1d5db;
  transition: all 0.3s ease;
}

:deep(.arco-color-picker-panel .arco-color-picker-palette) {
  background-color: #ffffff;
}

/* 下拉菜单暗色模式 */
.dark-mode :deep(.arco-dropdown-list) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-mode :deep(.arco-dropdown-option) {
  color: #f9fafb;
}

.dark-mode :deep(.arco-dropdown-option:hover) {
  background-color: #4b5563;
}

/* 颜色选择器暗色模式 */
.dark-collapse :deep(.arco-color-picker-trigger) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-mode :deep(.arco-color-picker-panel) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-mode :deep(.arco-color-picker-panel .arco-color-picker-palette) {
  background-color: #374151;
}

/* Scrollbar 样式 - 亮色模式 */
.sider-content::-webkit-scrollbar {
  width: 6px;
}

.sider-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.sider-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.sider-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Scrollbar 暗色模式 */
.dark-sider-content::-webkit-scrollbar {
  width: 6px;
}

.dark-sider-content::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark-sider-content::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.dark-sider-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
