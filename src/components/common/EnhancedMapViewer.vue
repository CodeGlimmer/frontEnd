<template>
  <div class="enhanced-map-container">
    <!-- ROS 地图显示 -->
    <div v-if="mapSource === 'ros'" class="map-display">
      <MapViewer :ros-url="rosUrl" />
    </div>

    <!-- 本地文件地图显示 -->
    <div v-else-if="mapSource === 'local'" class="local-map-display">
      <!-- 文件上传区域 -->
      <div v-if="!localMapLoaded" class="file-upload-area">
        <v-card class="upload-card" variant="outlined">
          <v-card-item>
            <v-card-title class="text-center">
              <v-icon size="48" color="primary" class="mb-2">mdi-map-plus</v-icon>
              <div>上传地图文件</div>
            </v-card-title>
            <v-card-subtitle class="text-center">
              请选择 PGM 图像文件和对应的 YAML 配置文件
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-row dense>
              <!-- PGM 文件上传 -->
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="pgmFile"
                  label="PGM 图像文件"
                  accept=".pgm"
                  prepend-icon="mdi-image"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  @change="handlePgmFileChange"
                />
              </v-col>

              <!-- YAML 文件上传 -->
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="yamlFile"
                  label="YAML 配置文件"
                  accept=".yaml,.yml"
                  prepend-icon="mdi-file-cog"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  @change="handleYamlFileChange"
                />
              </v-col>
            </v-row>

            <!-- 加载按钮 -->
            <div class="text-center mt-4">
              <v-btn
                color="primary"
                size="large"
                :disabled="!pgmFile || !yamlFile"
                :loading="isLoading"
                @click="loadLocalMap"
              >
                <v-icon start>mdi-upload</v-icon>
                加载地图
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 本地地图显示区域 -->
      <div v-else class="local-map-viewer">
        <div class="map-controls mb-2">
          <v-btn-group variant="outlined" density="compact">
            <v-btn @click="zoomIn" icon="mdi-magnify-plus" />
            <v-btn @click="zoomOut" icon="mdi-magnify-minus" />
            <v-btn @click="resetView" icon="mdi-fit-to-screen" />
            <v-btn @click="clearMap" icon="mdi-close" color="error" />
          </v-btn-group>
        </div>

        <div ref="localMapContainer" class="local-map-canvas">
          <canvas
            ref="mapCanvas"
            class="map-canvas"
            @wheel="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          ></canvas>
        </div>

        <!-- 地图信息显示 -->
        <v-card class="map-info mt-2" variant="outlined">
          <v-card-text class="py-2">
            <v-row dense>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">分辨率</div>
                <div class="text-body-2">{{ mapInfo.resolution }} m/pixel</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">尺寸</div>
                <div class="text-body-2">{{ mapInfo.width }} × {{ mapInfo.height }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">原点</div>
                <div class="text-body-2">[{{ mapInfo.origin.x }}, {{ mapInfo.origin.y }}]</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">缩放</div>
                <div class="text-body-2">{{ Math.round(zoom * 100) }}%</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- 错误信息显示 -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="ma-4"
      closable
      @click:close="clearError"
    >
      <v-alert-title>加载错误</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- 加载状态 -->
    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular size="64" indeterminate color="primary" />
      <div class="text-h6 mt-4">{{ loadingMessage }}</div>
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import MapViewer from './MapViewer.vue'
import yaml from 'js-yaml'

// Props
const props = defineProps({
  mapSource: {
    type: String,
    default: 'ros',
    validator: (value) => ['ros', 'local'].includes(value),
  },
  rosUrl: {
    type: String,
    default: 'ws://192.168.0.100:9090',
  },
})

// 响应式数据
const pgmFile = ref(null)
const yamlFile = ref(null)
const localMapLoaded = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('')
const error = ref(null)

// 地图显示相关
const mapCanvas = ref(null)
const localMapContainer = ref(null)
const mapImage = ref(null)
const mapInfo = ref({
  resolution: 0,
  width: 0,
  height: 0,
  origin: { x: 0, y: 0, theta: 0 },
})

// 视图控制
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
}

// 计算属性
const canvasContext = computed(() => {
  return mapCanvas.value?.getContext('2d')
})

// 方法
const clearError = () => {
  error.value = null
}

const handlePgmFileChange = (files) => {
  if (files && files.length > 0) {
    pgmFile.value = files[0]
  }
}

const handleYamlFileChange = (files) => {
  if (files && files.length > 0) {
    yamlFile.value = files[0]
  }
}

const loadLocalMap = async () => {
  if (!pgmFile.value || !yamlFile.value) {
    error.value = '请选择 PGM 和 YAML 文件'
    return
  }

  isLoading.value = true
  loadingMessage.value = '正在解析地图文件...'
  error.value = null

  try {
    // 读取 YAML 配置文件
    const yamlContent = await readFileAsText(yamlFile.value)
    const mapConfig = yaml.load(yamlContent)

    // 更新地图信息
    mapInfo.value = {
      resolution: mapConfig.resolution || 0.05,
      width: 0,
      height: 0,
      origin: {
        x: mapConfig.origin?.[0] || 0,
        y: mapConfig.origin?.[1] || 0,
        theta: mapConfig.origin?.[2] || 0,
      },
    }

    loadingMessage.value = '正在加载地图图像...'

    // 读取 PGM 图像文件
    await loadPgmImage(pgmFile.value)

    localMapLoaded.value = true
    isLoading.value = false

    // 等待 DOM 更新后初始化画布
    await nextTick()
    initializeCanvas()
  } catch (err) {
    console.error('地图加载错误:', err)
    error.value = `地图加载失败: ${err.message}`
    isLoading.value = false
  }
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

const loadPgmImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        const pgmData = parsePgmFile(arrayBuffer)

        // 创建图像数据
        const imageData = createImageDataFromPgm(pgmData)
        mapImage.value = imageData

        // 更新地图尺寸信息
        mapInfo.value.width = pgmData.width
        mapInfo.value.height = pgmData.height

        resolve()
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('PGM 文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const parsePgmFile = (arrayBuffer) => {
  const uint8Array = new Uint8Array(arrayBuffer)
  let offset = 0

  // 读取文件头
  const header = []
  let currentLine = ''

  // 读取 P5 标识
  while (offset < uint8Array.length) {
    const char = String.fromCharCode(uint8Array[offset++])
    if (char === '\n') {
      if (currentLine.trim() && !currentLine.startsWith('#')) {
        header.push(currentLine.trim())
      }
      currentLine = ''
      if (header.length >= 3) break
    } else if (char !== '\r') {
      currentLine += char
    }
  }

  if (header[0] !== 'P5') {
    throw new Error('不是有效的 PGM P5 格式文件')
  }

  const [width, height] = header[1].split(' ').map(Number)
  const maxVal = parseInt(header[2])

  // 读取图像数据
  const imageData = uint8Array.slice(offset)

  return {
    width,
    height,
    maxVal,
    data: imageData,
  }
}

const createImageDataFromPgm = (pgmData) => {
  const { width, height, data, maxVal } = pgmData
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imageData = ctx.createImageData(width, height)
  const pixels = imageData.data

  for (let i = 0; i < data.length; i++) {
    const grayValue = (data[i] / maxVal) * 255
    const pixelIndex = i * 4

    // 根据占用栅格地图的约定进行颜色映射
    let r, g, b
    if (data[i] === 0) {
      // 障碍物 - 黑色
      r = g = b = 0
    } else if (data[i] === maxVal) {
      // 自由空间 - 白色
      r = g = b = 255
    } else {
      // 未知区域 - 灰色
      r = g = b = 128
    }

    pixels[pixelIndex] = r // Red
    pixels[pixelIndex + 1] = g // Green
    pixels[pixelIndex + 2] = b // Blue
    pixels[pixelIndex + 3] = 255 // Alpha
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

const initializeCanvas = () => {
  if (!mapCanvas.value || !mapImage.value) return

  const container = localMapContainer.value
  if (!container) return

  // 设置画布尺寸
  const containerRect = container.getBoundingClientRect()
  mapCanvas.value.width = containerRect.width
  mapCanvas.value.height = containerRect.height

  // 重置视图
  resetView()
}

const drawMap = () => {
  if (!canvasContext.value || !mapImage.value) return

  const ctx = canvasContext.value
  const canvas = mapCanvas.value

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 计算绘制参数
  const imageWidth = mapImage.value.width * zoom.value
  const imageHeight = mapImage.value.height * zoom.value
  const x = (canvas.width - imageWidth) / 2 + panX.value
  const y = (canvas.height - imageHeight) / 2 + panY.value

  // 绘制地图
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(mapImage.value, x, y, imageWidth, imageHeight)
}

// 视图控制方法
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 10)
  drawMap()
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.1)
  drawMap()
}

const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  drawMap()
}

const clearMap = () => {
  localMapLoaded.value = false
  pgmFile.value = null
  yamlFile.value = null
  mapImage.value = null
  error.value = null
}

// 鼠标事件处理
const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.1, Math.min(10, zoom.value * delta))
  drawMap()
}

const handleMouseDown = (event) => {
  isDragging.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return

  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y

  panX.value += deltaX
  panY.value += deltaY

  lastMousePos.value = { x: event.clientX, y: event.clientY }
  drawMap()
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', initializeCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', initializeCanvas)
})
</script>

<style scoped>
.enhanced-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.map-display,
.local-map-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.file-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.upload-card {
  max-width: 600px;
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-card:hover {
  transform: translateY(-4px);
}

.local-map-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.local-map-canvas {
  flex: 1;
  position: relative;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.map-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  display: block;
}

.map-canvas:active {
  cursor: grabbing;
}

.map-info {
  border-radius: 8px;
}

.map-info .text-caption {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.map-info .text-body-2 {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .file-upload-area {
    padding: 1rem;
  }

  .upload-card {
    max-width: none;
  }

  .map-controls {
    flex-wrap: wrap;
  }

  .local-map-canvas {
    min-height: 300px;
  }
}

/* 动画效果 */
.v-file-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-file-input:hover {
  transform: translateY(-1px);
}

.v-btn-group .v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn-group .v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* 加载状态样式 */
.v-overlay .v-progress-circular {
  margin-bottom: 1rem;
}
</style>
