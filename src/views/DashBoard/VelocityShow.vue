<template>
  <v-card class="agv-monitor" elevation="12" :loading="isLoading">
    <v-card-title class="d-flex align-center justify-space-between py-2">
      <span class="text-subtitle-1 font-weight-medium">
        {{ titles[currentIndex] }}
      </span>
      <div class="d-flex align-center">
        <v-btn
          icon
          variant="text"
          size="small"
          @click="isPaused = !isPaused"
          :color="isPaused ? 'warning' : 'default'"
        >
          <v-icon>{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="resetData" color="error">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4 flex-grow-1">
      <div class="carousel-container">
        <transition-group name="slide" tag="div" class="carousel-wrapper">
          <!-- Linear Velocity Chart -->
          <div
            v-show="currentIndex === 0"
            key="linear-velocity"
            class="chart-container"
            ref="linearVelocityChart"
          ></div>

          <!-- Angular Velocity Chart -->
          <div
            v-show="currentIndex === 1"
            key="angular-velocity"
            class="chart-container"
            ref="angularVelocityChart"
          ></div>

          <!-- Position Tracking Chart -->
          <div
            v-show="currentIndex === 2"
            key="position"
            class="chart-container position-chart"
            ref="positionChart"
          ></div>
        </transition-group>

        <!-- Carousel Indicators -->
        <div class="carousel-indicators">
          <div
            v-for="(_, index) in titles"
            :key="index"
            class="indicator"
            :class="{ active: currentIndex === index }"
            @click="goToSlide(index)"
          ></div>
        </div>
      </div>
    </v-card-text>

    <!-- 错误和状态提示 -->
    <v-slide-y-transition>
      <v-alert v-if="connectionError" border="start" variant="tonal" type="error" class="ma-2">
        <template v-slot:prepend>
          <v-icon icon="mdi-alert-circle" />
        </template>
        <div class="d-flex flex-column">
          <strong>连接错误</strong>
          <span class="text-caption">{{ connectionError }}</span>
          <v-btn class="mt-2" size="small" color="error" variant="text" @click="retryConnection">
            重试连接
            <v-icon end>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </v-alert>
    </v-slide-y-transition>

    <v-slide-y-transition>
      <v-alert
        v-if="!connectionError && !isConnected"
        border="start"
        variant="tonal"
        type="info"
        class="ma-2"
      >
        <template v-slot:prepend>
          <v-progress-circular indeterminate size="20" width="2" color="info" />
        </template>
        <div class="d-flex flex-column">
          <strong>正在连接</strong>
          <span class="text-caption">尝试连接到 {{ props.rosbridgeUrl }}</span>
        </div>
      </v-alert>
    </v-slide-y-transition>

    <v-card-actions class="pt-0 px-2 pb-2">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        :disabled="currentIndex === 0"
        @click="prevSlide"
      >
        <v-icon start>mdi-chevron-left</v-icon>
        上一页
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        :disabled="currentIndex === titles.length - 1"
        @click="nextSlide"
      >
        下一页
        <v-icon end>mdi-chevron-right</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import ROSLIB from 'roslib'

// Props
const props = defineProps({
  rosbridgeUrl: {
    type: String,
    default: 'ws://localhost:9091',
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
  slideDuration: {
    type: Number,
    default: 10000,
  },
})

// Refs & Reactive States
const titles = ['线速度监控', '角速度监控', '位置追踪']
const currentIndex = ref(0)
const isPaused = ref(!props.autoPlay)
const isConnected = ref(false)
const connectionError = ref(null)
const isLoading = ref(false)
const connectionAttempts = ref(0)
const maxRetries = 3

// Charts refs
const linearVelocityChart = ref(null)
const angularVelocityChart = ref(null)
const positionChart = ref(null)

// Chart instances
let linearVelocityChartInstance = null
let angularVelocityChartInstance = null
let positionChartInstance = null

// Data storage
const maxDataPoints = 100
const linearVelocityData = ref([])
const angularVelocityData = ref([])
const timestampData = ref([])
const calculatedPositions = ref([])
const reportedPositions = ref([])

// Position tracking variables
let currentX = 0
let currentY = 0
let currentTheta = 0
let lastTimestamp = null

// ROS connection
let ros = null
let linearVelocitySub = null
let angularVelocitySub = null
let poseSub = null
let carouselInterval = null

// Initialize ROS connection
const initRos = async () => {
  isLoading.value = true
  try {
    ros = new ROSLIB.Ros({
      url: props.rosbridgeUrl,
    })

    ros.on('connection', () => {
      console.log('Connected to ROS bridge server')
      isConnected.value = true
      connectionError.value = null
      connectionAttempts.value = 0
      initSubscribers()
    })

    ros.on('error', (error) => {
      console.error('ROS connection error:', error)
      const errorMessage = error.message || error.toString()
      connectionError.value = `连接错误: ${errorMessage}`
      isConnected.value = false
      handleConnectionError()
    })

    ros.on('close', () => {
      console.log('ROS connection closed')
      isConnected.value = false
      if (!connectionError.value) {
        connectionError.value = '连接已断开'
        handleConnectionError()
      }
    })
  } catch (error) {
    console.error('ROS initialization error:', error)
    connectionError.value = `初始化失败: ${error.message}`
    isConnected.value = false
  } finally {
    isLoading.value = false
  }
}

// Handle connection error
const handleConnectionError = () => {
  if (connectionAttempts.value < maxRetries) {
    connectionAttempts.value++
    console.log(`Retrying connection (${connectionAttempts.value}/${maxRetries})...`)
    setTimeout(() => {
      retryConnection()
    }, 3000 * connectionAttempts.value) // Incremental retry delay
  }
}

// Retry connection
const retryConnection = () => {
  if (ros) {
    ros.close()
  }
  connectionError.value = null
  initRos()
}

// Initialize subscribers
const initSubscribers = () => {
  try {
    // Linear velocity subscriber
    linearVelocitySub = new ROSLIB.Topic({
      ros: ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    })

    linearVelocitySub.subscribe((message) => {
      if (isPaused.value) return

      const now = new Date()
      const timestamp = now.toLocaleTimeString('zh-CN', { hour12: false })
      const linearVel = Math.sqrt(
        Math.pow(message.linear.x, 2) +
          Math.pow(message.linear.y, 2) +
          Math.pow(message.linear.z, 2),
      )

      linearVelocityData.value.push(linearVel)
      if (linearVelocityData.value.length > maxDataPoints) {
        linearVelocityData.value.shift()
      }

      timestampData.value.push(timestamp)
      if (timestampData.value.length > maxDataPoints) {
        timestampData.value.shift()
      }

      updateLinearVelocityChart()

      // Update position based on velocity
      if (lastTimestamp !== null) {
        const deltaTime = (now - lastTimestamp) / 1000 // in seconds
        updatePosition(message.linear.x, message.linear.y, message.angular.z, deltaTime)
      }

      lastTimestamp = now
    })

    // Angular velocity subscriber
    angularVelocitySub = new ROSLIB.Topic({
      ros: ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    })

    angularVelocitySub.subscribe((message) => {
      if (isPaused.value) return

      angularVelocityData.value.push(message.angular.z)
      if (angularVelocityData.value.length > maxDataPoints) {
        angularVelocityData.value.shift()
      }

      updateAngularVelocityChart()
    })

    // Try to subscribe to pose if available
    try {
      poseSub = new ROSLIB.Topic({
        ros: ros,
        name: '/pose',
        messageType: 'geometry_msgs/PoseStamped',
      })

      poseSub.subscribe((message) => {
        if (isPaused.value) return

        const pose = message.pose
        reportedPositions.value.push([pose.position.x, pose.position.y])

        if (reportedPositions.value.length > maxDataPoints) {
          reportedPositions.value.shift()
        }

        updatePositionChart()
      })
    } catch (error) {
      console.warn('Failed to subscribe to pose topic, will use calculated positions only:', error)
    }
  } catch (error) {
    console.error('Failed to initialize subscribers:', error)
    connectionError.value = `订阅失败: ${error.message}`
  }
}

// Update position based on velocity and angular velocity
const updatePosition = (linearX, linearY, angularZ, deltaTime) => {
  // Update theta (orientation)
  currentTheta += angularZ * deltaTime

  // Update position based on linear velocity and orientation
  currentX += linearX * Math.cos(currentTheta) * deltaTime
  currentY += linearX * Math.sin(currentTheta) * deltaTime

  // Add to calculated positions array
  calculatedPositions.value.push([currentX, currentY])

  if (calculatedPositions.value.length > maxDataPoints) {
    calculatedPositions.value.shift()
  }

  updatePositionChart()
}

// Initialize charts
const initCharts = () => {
  // Linear velocity chart
  linearVelocityChartInstance = echarts.init(linearVelocityChart.value)
  const linearVelocityOption = {
    grid: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 50,
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} m/s',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '线速度 (m/s)',
      nameTextStyle: {
        padding: [0, 0, 0, 40],
      },
    },
    series: [
      {
        name: '线速度',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: {
          width: 2,
          color: '#1976D2',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 118, 210, 0.5)' },
            { offset: 1, color: 'rgba(25, 118, 210, 0.1)' },
          ]),
        },
        data: [],
      },
    ],
    animation: true,
    animationDuration: 300,
  }
  linearVelocityChartInstance.setOption(linearVelocityOption)

  // Angular velocity chart
  angularVelocityChartInstance = echarts.init(angularVelocityChart.value)
  const angularVelocityOption = {
    grid: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 50,
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} rad/s',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '角速度 (rad/s)',
      nameTextStyle: {
        padding: [0, 0, 0, 40],
      },
    },
    series: [
      {
        name: '角速度',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: {
          width: 2,
          color: '#7B1FA2',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(123, 31, 162, 0.5)' },
            { offset: 1, color: 'rgba(123, 31, 162, 0.1)' },
          ]),
        },
        data: [],
      },
    ],
    animation: true,
    animationDuration: 300,
  }
  angularVelocityChartInstance.setOption(angularVelocityOption)

  // Position chart
  positionChartInstance = echarts.init(positionChart.value)
  const positionOption = {
    grid: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 50,
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `坐标: (${params.data[0].toFixed(2)}, ${params.data[1].toFixed(2)})`
      },
    },
    xAxis: {
      type: 'value',
      name: 'X (m)',
      nameLocation: 'middle',
      nameGap: 25,
    },
    yAxis: {
      type: 'value',
      name: 'Y (m)',
      nameLocation: 'middle',
      nameGap: 35,
    },
    series: [
      {
        name: '计算位置',
        type: 'scatter',
        symbolSize: 8,
        itemStyle: {
          color: '#4CAF50',
        },
        data: calculatedPositions.value,
      },
      {
        name: '实际轨迹',
        type: 'line',
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#4CAF50',
          type: 'dashed',
        },
        data: calculatedPositions.value,
      },
      {
        name: '报告位置',
        type: 'scatter',
        symbolSize: 8,
        itemStyle: {
          color: '#FF5722',
        },
        data: reportedPositions.value,
      },
      {
        name: '报告轨迹',
        type: 'line',
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#FF5722',
          type: 'solid',
        },
        data: reportedPositions.value,
      },
      {
        name: '当前位置',
        type: 'effectScatter',
        symbolSize: 15,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
        },
        itemStyle: {
          color: '#2196F3',
        },
        data: [[currentX, currentY]],
      },
    ],
    animation: true,
    animationDuration: 300,
  }
  positionChartInstance.setOption(positionOption)
}

// Update charts
const updateLinearVelocityChart = () => {
  if (!linearVelocityChartInstance) return

  linearVelocityChartInstance.setOption({
    xAxis: {
      data: timestampData.value,
    },
    series: [
      {
        data: linearVelocityData.value,
      },
    ],
  })
}

const updateAngularVelocityChart = () => {
  if (!angularVelocityChartInstance) return

  angularVelocityChartInstance.setOption({
    xAxis: {
      data: timestampData.value,
    },
    series: [
      {
        data: angularVelocityData.value,
      },
    ],
  })
}

const updatePositionChart = () => {
  if (!positionChartInstance) return

  positionChartInstance.setOption({
    series: [
      {
        data: calculatedPositions.value,
      },
      {
        data: calculatedPositions.value,
      },
      {
        data: reportedPositions.value,
      },
      {
        data: reportedPositions.value,
      },
      {
        data: [[currentX, currentY]],
      },
    ],
  })
}

// Carousel control functions
const nextSlide = () => {
  if (currentIndex.value < titles.length - 1) {
    currentIndex.value++
    updateChartVisibility()
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    updateChartVisibility()
  }
}

const goToSlide = (index) => {
  currentIndex.value = index
  updateChartVisibility()
}

const updateChartVisibility = () => {
  nextTick(() => {
    if (currentIndex.value === 0 && linearVelocityChartInstance) {
      linearVelocityChartInstance.resize()
    } else if (currentIndex.value === 1 && angularVelocityChartInstance) {
      angularVelocityChartInstance.resize()
    } else if (currentIndex.value === 2 && positionChartInstance) {
      positionChartInstance.resize()
    }
  })
}

const startCarousel = () => {
  clearInterval(carouselInterval)
  if (isPaused.value) return

  carouselInterval = setInterval(() => {
    if (currentIndex.value < titles.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
    updateChartVisibility()
  }, props.slideDuration)
}

const resetData = () => {
  linearVelocityData.value = []
  angularVelocityData.value = []
  timestampData.value = []
  calculatedPositions.value = []
  reportedPositions.value = []
  currentX = 0
  currentY = 0
  currentTheta = 0
  lastTimestamp = null

  updateLinearVelocityChart()
  updateAngularVelocityChart()
  updatePositionChart()
}

// Handle window resize
const handleResize = () => {
  linearVelocityChartInstance && linearVelocityChartInstance.resize()
  angularVelocityChartInstance && angularVelocityChartInstance.resize()
  positionChartInstance && positionChartInstance.resize()
}

// Watch for changes
watch(isPaused, (newVal) => {
  if (newVal) {
    clearInterval(carouselInterval)
  } else {
    startCarousel()
  }
})

// Lifecycle hooks
onMounted(() => {
  // Initialize charts and ROS connection
  nextTick(() => {
    initCharts()
    initRos()
    startCarousel()
    window.addEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  // Clean up
  clearInterval(carouselInterval)
  window.removeEventListener('resize', handleResize)

  if (linearVelocitySub) {
    linearVelocitySub.unsubscribe()
  }

  if (angularVelocitySub) {
    angularVelocitySub.unsubscribe()
  }

  if (poseSub) {
    poseSub.unsubscribe()
  }

  if (ros) {
    ros.close()
  }

  if (linearVelocityChartInstance) {
    linearVelocityChartInstance.dispose()
  }

  if (angularVelocityChartInstance) {
    angularVelocityChartInstance.dispose()
  }

  if (positionChartInstance) {
    positionChartInstance.dispose()
  }
})
</script>

<style scoped>
.agv-monitor {
  position: relative;
  width: 100%;
  min-width: 350px;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.agv-monitor:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 350px;
  min-height: 320px;
  overflow: hidden;
  flex: 1;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.position-chart {
  width: 100%;
  height: 100%;
}

.carousel-indicators {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #1976d2;
  transform: scale(1.2);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.error-message {
  margin-top: 4px;
}

.connection-status {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

/* Gradient background for the active chart */
.chart-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  /* background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8)); */
  pointer-events: none;
  z-index: 2;
}

/* Pulse animation for connection status */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.connection-status .v-icon {
  animation: pulse 2s infinite;
}

.connection-status .v-icon.mdi-lan-connect {
  animation: none;
}

/* Material Design elevation transitions */
.elevation-3 {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Material Design状态指示器样式 */
.connection-status {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  padding: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Material Design动画 */
.v-alert {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式调整 */
@media (max-width: 1280px) {
  .agv-monitor {
    min-width: 300px;
    min-height: 350px;
  }

  .carousel-container {
    height: 300px;
    min-height: 280px;
  }
}

@media (max-width: 960px) {
  .agv-monitor {
    min-width: 280px;
    min-height: 320px;
  }

  .carousel-container {
    height: 280px;
    min-height: 250px;
  }
}

@media (max-width: 600px) {
  .agv-monitor {
    min-width: 250px;
    min-height: 300px;
  }

  .carousel-container {
    height: 250px;
    min-height: 220px;
  }
}
</style>
