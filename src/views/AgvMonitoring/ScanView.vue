<template>
  <v-app>
    <v-app-bar density="compact" elevation="2" color="primary">
      <v-app-bar-title>ROS雷达数据可视化</v-app-bar-title>
      <v-spacer></v-spacer>
      <connection-status :status="connectionStatus" />
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="3">
            <v-card class="mb-4" elevation="2">
              <v-card-title class="text-h6">
                <v-icon start>mdi-connection</v-icon>
                连接设置
              </v-card-title>
              <v-card-text>
                <v-form v-model="isFormValid" @submit.prevent="connectToROS">
                  <v-text-field
                    v-model="rosbridge.url"
                    label="Rosbridge URL"
                    placeholder="ws://localhost:9090"
                    :rules="[(v) => !!v || '请输入URL']"
                    variant="outlined"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model="rosbridge.topicName"
                    label="雷达Topic名称"
                    placeholder="/scan"
                    :rules="[(v) => !!v || '请输入Topic名称']"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                  <v-btn
                    block
                    color="primary"
                    type="submit"
                    :disabled="!isFormValid"
                    :loading="connecting"
                    class="text-none"
                  >
                    {{ isConnected ? '断开连接' : '连接' }}
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>

            <v-card elevation="2">
              <v-card-title class="text-h6">
                <v-icon start>mdi-tune</v-icon>
                可视化设置
              </v-card-title>
              <v-card-text>
                <v-select
                  v-model="visualizationMode"
                  :items="visualizationModes"
                  label="可视化模式"
                  variant="outlined"
                  class="mb-2"
                ></v-select>

                <v-slider
                  v-model="pointSize"
                  label="点大小"
                  min="1"
                  max="10"
                  step="0.5"
                  thumb-label
                  class="mb-2"
                ></v-slider>

                <v-slider
                  v-model="maxRange"
                  label="最大显示距离(m)"
                  min="1"
                  max="100"
                  thumb-label
                  class="mb-2"
                ></v-slider>

                <v-checkbox v-model="showGrid" label="显示网格" class="mb-2"></v-checkbox>

                <v-checkbox v-model="showStats" label="显示性能统计" class="mb-2"></v-checkbox>

                <v-expansion-panels variant="accordion">
                  <v-expansion-panel title="颜色设置">
                    <v-expansion-panel-text>
                      <v-radio-group v-model="colorMode" inline>
                        <v-radio label="单色" value="single"></v-radio>
                        <v-radio label="距离渐变" value="distance"></v-radio>
                        <v-radio label="强度渐变" value="intensity"></v-radio>
                      </v-radio-group>

                      <v-color-picker
                        v-if="colorMode === 'single'"
                        v-model="pointColor"
                        hide-inputs
                        hide-canvas
                        class="ma-2"
                      ></v-color-picker>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

                  <v-expansion-panel title="高级设置">
                    <v-expansion-panel-text>
                      <v-checkbox v-model="accumulate" label="累积扫描" class="mb-2"></v-checkbox>

                      <v-slider
                        v-if="accumulate"
                        v-model="accumulateFrames"
                        label="累积帧数"
                        min="2"
                        max="30"
                        thumb-label
                        class="mb-2"
                      ></v-slider>

                      <v-checkbox
                        v-model="showTrajectory"
                        label="显示轨迹"
                        class="mb-2"
                      ></v-checkbox>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="9">
            <v-card height="600" elevation="2" class="mb-4 visualization-card">
              <div class="visualization-container" ref="visualizationContainer"></div>

              <v-overlay
                :model-value="!isConnected"
                contained
                persistent
                class="align-center justify-center"
              >
                <v-card class="pa-4 text-center" width="300">
                  <v-icon size="64" color="grey">mdi-radar</v-icon>
                  <div class="text-h6 mt-2">请连接到ROS</div>
                  <div class="text-body-2 text-grey">请在左侧设置Rosbridge URL和雷达Topic</div>
                </v-card>
              </v-overlay>

              <div v-if="showStats" class="stats-panel">
                <stats-display :data="statsData" />
              </div>

              <v-btn
                v-if="isConnected"
                icon="mdi-fullscreen"
                size="small"
                class="fullscreen-button"
                @click="toggleFullscreen"
              ></v-btn>
            </v-card>

            <v-row>
              <v-col cols="12" md="6">
                <v-card elevation="2" height="300">
                  <v-card-title class="text-h6">
                    <v-icon start>mdi-chart-line</v-icon>
                    数据分析
                  </v-card-title>
                  <div class="chart-container" ref="chartContainer"></div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card elevation="2" height="300">
                  <v-card-title class="text-h6">
                    <v-icon start>mdi-information-outline</v-icon>
                    雷达信息
                  </v-card-title>
                  <v-card-text>
                    <v-table density="compact">
                      <tbody>
                        <tr v-for="(value, key) in radarInfo" :key="key">
                          <td class="text-grey">{{ key }}</td>
                          <td>{{ value }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">关闭</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="exportDialog" max-width="500">
      <v-card>
        <v-card-title>导出数据</v-card-title>
        <v-card-text>
          <v-radio-group v-model="exportFormat">
            <v-radio label="CSV" value="csv"></v-radio>
            <v-radio label="JSON" value="json"></v-radio>
            <v-radio label="图片 (PNG)" value="png"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="exportDialog = false">取消</v-btn>
          <v-btn color="primary" @click="exportData">导出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as ROSLIB from 'roslib'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as echarts from 'echarts'
import Stats from 'stats.js'

// 统计信息展示组件
const StatsDisplay = {
  props: {
    data: Object,
  },
  template: `
      <div class="stats-display">
        <div class="stat-item">
          <div class="stat-label">点数量</div>
          <div class="stat-value">{{ data.pointCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">帧率</div>
          <div class="stat-value">{{ data.fps.toFixed(1) }} FPS</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">最大距离</div>
          <div class="stat-value">{{ data.maxRange.toFixed(2) }}m</div>
        </div>
      </div>
    `,
}

// 表单验证状态
const isFormValid = ref(false)
const connecting = ref(false)
const isConnected = ref(false)
const connectionStatus = ref('disconnected')

// Rosbridge连接设置
const rosbridge = reactive({
  url: 'ws://localhost:9090',
  topicName: '/scan',
})

// 可视化设置
const visualizationMode = ref('3D')
const visualizationModes = ['3D']
const pointSize = ref(3)
const maxRange = ref(30)
const showGrid = ref(true)
const showStats = ref(true)
const colorMode = ref('distance')
const pointColor = ref('#42A5F5')
const accumulate = ref(false)
const accumulateFrames = ref(5)
const showTrajectory = ref(false)

// ROS连接对象
let ros = null
let topic = null

// 三维场景对象
let scene = null
let camera = null
let renderer = null
let controls = null

// 图表对象
let chart = null

// 雷达数据
const radarData = ref([])
const radarInfo = reactive({
  帧ID: '-',
  雷达类型: '-',
  角度范围: '-',
  角度分辨率: '-',
  扫描频率: '-',
  点数量: '-',
  最小距离: '-',
  最大距离: '-',
  更新时间: '-',
})

// 性能统计
let stats = null
const statsData = reactive({
  pointCount: 0,
  fps: 0,
  maxRange: 0,
})

// UI状态
const isDark = ref(false)
const snackbar = reactive({
  show: false,
  text: '',
  color: 'info',
})
const exportDialog = ref(false)
const exportFormat = ref('csv')

// 动画帧ID
let animationFrameId = null

// 数据缓冲区（用于累积模式）
const dataBuffer = ref([])

// DOM引用
const visualizationContainer = ref(null)
const chartContainer = ref(null)

// 连接到ROS
function connectToROS() {
  if (isConnected.value) {
    disconnectROS()
    return
  }

  connecting.value = true
  connectionStatus.value = 'connecting'

  try {
    // 创建ROS连接
    ros = new ROSLIB.Ros({
      url: rosbridge.url,
    })

    // 连接事件处理
    ros.on('connection', () => {
      isConnected.value = true
      connectionStatus.value = 'connected'
      connecting.value = false
      showSnackbar('已连接到ROS', 'success')

      // 清除缓存数据
      radarData.value = []
      dataBuffer.value = []

      // 初始化可视化
      initVisualization()
      subscribeToTopic()
    })

    ros.on('error', (error) => {
      console.error('ROS连接错误:', error)
      isConnected.value = false
      connectionStatus.value = 'disconnected'
      connecting.value = false
      showSnackbar('ROS连接失败', 'error')
    })

    ros.on('close', () => {
      isConnected.value = false
      connectionStatus.value = 'disconnected'
      connecting.value = false
      showSnackbar('ROS连接已关闭', 'info')
    })
  } catch (e) {
    console.error('ROS连接异常:', e)
    isConnected.value = false
    connectionStatus.value = 'disconnected'
    connecting.value = false
    showSnackbar('ROS连接异常: ' + e.message, 'error')
  }
}

// 断开ROS连接
function disconnectROS() {
  if (topic) {
    topic.unsubscribe()
    topic = null
  }

  if (ros) {
    ros.close()
    ros = null
  }

  isConnected.value = false
  connectionStatus.value = 'disconnected'

  // 停止渲染循环
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// 订阅ROS话题
function subscribeToTopic() {
  if (!ros || !isConnected.value) return

  // 创建话题对象
  topic = new ROSLIB.Topic({
    ros: ros,
    name: rosbridge.topicName,
    messageType: 'sensor_msgs/LaserScan',
  })

  // 订阅话题消息
  topic.subscribe((message) => {
    processLaserScan(message)
  })
}

// 处理激光雷达数据
function processLaserScan(message) {
  // 提取激光雷达数据
  const rangeData = []
  let validPoints = 0
  let minRange = Infinity
  let maxRange = 0

  // 处理雷达数据
  for (let i = 0; i < message.ranges.length; i++) {
    const range = message.ranges[i]
    // 忽略无效数据
    if (range < message.range_min || range > message.range_max) continue

    const angle = message.angle_min + i * message.angle_increment
    const intensity = message.intensities && message.intensities[i] ? message.intensities[i] : 1.0

    rangeData.push({
      angle,
      range,
      intensity,
    })

    validPoints++
    minRange = Math.min(minRange, range)
    maxRange = Math.max(maxRange, range)
  }

  // 更新雷达信息
  radarInfo.帧ID = message.header.seq
  radarInfo.雷达类型 = rosbridge.topicName
  radarInfo.角度范围 = `${((message.angle_min * 180) / Math.PI).toFixed(1)}° 到 ${((message.angle_max * 180) / Math.PI).toFixed(1)}°`
  radarInfo.角度分辨率 = `${((message.angle_increment * 180) / Math.PI).toFixed(2)}°`
  radarInfo.扫描频率 = `${(1 / message.scan_time).toFixed(1)}Hz`
  radarInfo.点数量 = validPoints
  radarInfo.最小距离 = `${minRange.toFixed(2)}m`
  radarInfo.最大距离 = `${maxRange.toFixed(2)}m`
  radarInfo.更新时间 = new Date().toLocaleTimeString()

  // 统计数据
  statsData.pointCount = validPoints
  statsData.maxRange = maxRange

  // 数据处理 - 累积模式
  if (accumulate.value) {
    dataBuffer.value.push(rangeData)
    if (dataBuffer.value.length > accumulateFrames.value) {
      dataBuffer.value.shift()
    }
    radarData.value = [].concat(...dataBuffer.value)
  } else {
    radarData.value = rangeData
  }

  // 更新图表
  updateChart(rangeData)
}

// 初始化可视化场景
function initVisualization() {
  init3DScene()

  // 初始化性能统计
  if (showStats.value) {
    stats = new Stats()
    stats.dom.style.position = 'absolute'
    stats.dom.style.top = '0px'
    stats.dom.style.right = '0px'
    visualizationContainer.value.appendChild(stats.dom)
  }

  // 开始渲染循环
  startRenderLoop()
}

// 初始化3D场景
function init3DScene() {
  const container = visualizationContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(isDark.value ? 0x1e1e1e : 0xf5f5f5)

  // 创建相机
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 0, 30)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // 添加网格
  if (showGrid.value) {
    const gridHelper = new THREE.GridHelper(
      maxRange.value * 2,
      20,
      new THREE.Color(0x555555),
      new THREE.Color(0x333333),
    )
    gridHelper.rotateX(Math.PI / 2)
    scene.add(gridHelper)
  }

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 10)
  scene.add(directionalLight)
}

// 初始化图表
function initChart() {
  const container = chartContainer.value
  if (!container) return

  chart = echarts.init(container, null, {
    renderer: 'canvas',
  })

  const option = {
    backgroundColor: 'transparent',
    title: {
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '角度(°)',
      data: [],
    },
    yAxis: {
      type: 'value',
      name: '距离(m)',
    },
    series: [
      {
        name: '雷达距离',
        type: 'line',
        sampling: 'average',
        data: [],
        lineStyle: {
          width: 2,
          color: '#42A5F5',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(66, 165, 245, 0.5)' },
            { offset: 1, color: 'rgba(66, 165, 245, 0.1)' },
          ]),
        },
      },
    ],
  }

  chart.setOption(option)
}

// 更新图表数据
function updateChart(data) {
  if (!chart) return

  // 对数据进行降采样，避免图表过于密集
  const angleValues = []
  const rangeValues = []

  // 每5个点取一个样本
  const step = Math.ceil(data.length / 100)

  for (let i = 0; i < data.length; i += step) {
    const point = data[i]
    if (point) {
      angleValues.push(((point.angle * 180) / Math.PI).toFixed(1))
      rangeValues.push(point.range.toFixed(2))
    }
  }

  chart.setOption({
    xAxis: {
      data: angleValues,
    },
    series: [
      {
        data: rangeValues,
      },
    ],
  })
}

// 渲染循环
function startRenderLoop() {
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    // 更新性能统计
    if (stats) {
      stats.update()
      statsData.fps = 1 / (stats.delta || 0.016)
    }

    // 更新控制器
    if (controls) {
      controls.update()
    }

    // 渲染3D场景
    render3D()
  }

  animate()
}

// 3D渲染
function render3D() {
  if (!scene || !camera || !renderer) return

  // 清除之前的点云
  scene.children.forEach((child) => {
    if (child.isPoints) {
      scene.remove(child)
    }
  })

  if (radarData.value.length > 0) {
    const positions = []
    const colors = []

    radarData.value.forEach((point) => {
      // 极坐标转笛卡尔坐标
      const x = point.range * Math.cos(point.angle)
      const y = point.range * Math.sin(point.angle)
      const z = 0

      positions.push(x, y, z)

      // 根据颜色模式设置颜色
      if (colorMode.value === 'single') {
        // 单色模式
        const color = new THREE.Color(pointColor.value)
        colors.push(color.r, color.g, color.b)
      } else if (colorMode.value === 'distance') {
        // 距离渐变
        const normalizedDist = Math.min(point.range / maxRange.value, 1.0)
        const color = new THREE.Color()
        color.setHSL(0.6 * (1.0 - normalizedDist), 1.0, 0.5)
        colors.push(color.r, color.g, color.b)
      } else if (colorMode.value === 'intensity') {
        // 强度渐变
        const normalizedIntensity = Math.min(point.intensity, 1.0)
        const color = new THREE.Color()
        color.setHSL(0.3 * normalizedIntensity, 1.0, 0.5)
        colors.push(color.r, color.g, color.b)
      }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: pointSize.value,
      vertexColors: true,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)
  }

  renderer.render(scene, camera)
}

// 窗口大小调整处理
function onResize() {
  if (!visualizationContainer.value) return

  const container = visualizationContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 调整3D渲染器
  if (renderer && camera) {
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  // 调整图表
  if (chart) {
    chart.resize()
  }
}

// 切换全屏
function toggleFullscreen() {
  const container = visualizationContainer.value

  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 显示提示消息
function showSnackbar(text, color = 'info') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

// 导出数据
function exportData() {
  if (!radarData.value.length) {
    showSnackbar('没有可导出的数据', 'warning')
    return
  }

  let content, filename, type

  switch (exportFormat.value) {
    case 'csv':
      content = 'angle,range,intensity\n'
      radarData.value.forEach((point) => {
        content += `${point.angle},${point.range},${point.intensity || 0}\n`
      })
      filename = 'radar_data.csv'
      type = 'text/csv'
      break

    case 'json':
      content = JSON.stringify(radarData.value, null, 2)
      filename = 'radar_data.json'
      type = 'application/json'
      break

    case 'png':
      if (renderer) {
        const dataURL = renderer.domElement.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataURL
        link.download = 'radar_visualization.png'
        link.click()
        exportDialog.value = false
        return
      } else {
        showSnackbar('无法导出图片', 'error')
        return
      }
  }

  // 创建下载链接
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // 释放URL对象
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)

  exportDialog.value = false
}

// 生命周期钩子
onMounted(() => {
  // 监听主题变化
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches

  // 初始化图表
  initChart()

  // 添加窗口缩放监听
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  // 清理资源
  disconnectROS()
  window.removeEventListener('resize', onResize)

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // 销毁3D渲染器
  if (renderer) {
    renderer.dispose()
  }

  // 销毁图表
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped>
.visualization-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.visualization-card {
  position: relative;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 230px;
}

.fullscreen-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.fullscreen-button:hover {
  opacity: 1;
}

.stats-panel {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  border-radius: 4px;
  z-index: 10;
}

.stats-display {
  display: flex;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
}

/* 动画效果 */
.v-card {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
}

.v-btn {
  transition: all 0.2s ease;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.v-chip:has(.mdi-lan-pending) {
  animation: pulse 1.5s infinite;
}
</style>
