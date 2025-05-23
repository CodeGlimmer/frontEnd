<template>
  <div class="main-viewer">
    <a-layout>
      <a-layout-sider :width="350">
        <div class="sider-content tw:dark:bg-m-grey-darken4">
          <a-collapse :default-active-key="['GlobalOptions', 'ConnectionSettings']">
            <a-collapse-item header="连接设置" key="ConnectionSettings">
              <div class="connection-settings">
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
      <a-layout-content>
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
        <div v-else class="connection-placeholder tw:dark:!bg-m-grey-darken4">
          <div>请设置WebSocket连接并点击"连接"按钮</div>
        </div>
        <div class="controls">
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
import { ref, onMounted } from 'vue'
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

// 黑暗模式状态管理
const isDarkMode = ref(true)

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
    background: '#303030',
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

.sider-content {
  height: 100%;
  overflow-y: auto;
  user-select: none;
}

.sider-content :deep(.arco-collapse-item-header-title) {
  word-wrap: break-word;
  flex-wrap: wrap;
  width: 260px;
}

.theme-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

.click-topic.active {
  background: aqua;
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
</style>
