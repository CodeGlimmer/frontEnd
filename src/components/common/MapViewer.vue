<template>
  <div class="map-container">
    <!-- 地图显示区域 -->
    <div v-show="!error" :id="mapId" class="tw:aspect-video"></div>

    <!-- 错误信息显示 -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="map-error"
      closable
      @click:close="retryConnection"
    >
      <v-alert-title>连接错误</v-alert-title>
      {{ error }}
      <template v-slot:append>
        <v-btn color="error" variant="text" @click.stop="retryConnection"> 重试连接 </v-btn>
      </template>
    </v-alert>

    <!-- 加载状态显示 -->
    <v-progress-circular v-if="isLoading" indeterminate color="primary" class="loading-indicator" />
  </div>
</template>

<script setup>
import * as ROSLIB from 'roslib'
import * as ROS2D from '@/lib/stdros/ros2d.js'
import { onMounted, onBeforeUnmount, ref, useId } from 'vue'

// Props 定义
const props = defineProps({
  rosUrl: {
    type: String,
    default: 'ws://localhost:9090',
  },
})

// 状态管理
const ros = ref(null)
const viewer = ref(null)
const gridClient = ref(null)
const mapId = useId()
const error = ref(null)
const isLoading = ref(false)

// 地图初始化函数
function initViewer() {
  if (!viewer.value) {
    viewer.value = new ROS2D.Viewer({
      divID: mapId,
      width: 640,
      height: 480,
    })
  }
}

// 地图客户端初始化函数
function initGridClient() {
  if (ros.value && viewer.value && !gridClient.value) {
    gridClient.value = new ROS2D.OccupancyGridClient({
      ros: ros.value,
      rootObject: viewer.value.scene,
    })

    gridClient.value.on('change', () => {
      if (viewer.value && gridClient.value?.currentGrid) {
        viewer.value.scaleToDimensions(
          gridClient.value.currentGrid.width,
          gridClient.value.currentGrid.height,
        )
        viewer.value.shift(
          gridClient.value.currentGrid.pose.position.x,
          gridClient.value.currentGrid.pose.position.y,
        )
      }
    })
  }
}

// 清理资源函数
function cleanup() {
  if (gridClient.value) {
    gridClient.value.unsubscribe()
    gridClient.value = null
  }
  if (viewer.value?.scene) {
    // 清理场景对象
    viewer.value = null
  }
}

// 重试连接函数
function retryConnection() {
  error.value = null
  isLoading.value = true
  cleanup()
  initRosConnection()
}

// ROS 连接初始化
function initRosConnection() {
  try {
    ros.value = new ROSLIB.Ros({
      url: props.rosUrl,
    })

    ros.value.on('error', (err) => {
      console.error('ROS连接错误:', err)
      error.value = `无法连接到ROS服务器 (${props.rosUrl})`
      isLoading.value = false
      cleanup()
    })

    ros.value.on('connection', () => {
      console.log('ROS连接成功')
      error.value = null
      isLoading.value = false
      initViewer()
      initGridClient()
    })

    ros.value.on('close', () => {
      console.log('ROS连接关闭')
      error.value = 'ROS连接已关闭'
      isLoading.value = false
      cleanup()
    })
  } catch (err) {
    console.error('ROS初始化错误:', err)
    error.value = '初始化ROS连接时发生错误'
    isLoading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  isLoading.value = true
  initRosConnection()
})

onBeforeUnmount(() => {
  if (ros.value) {
    ros.value.close()
  }
  cleanup()
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-error {
  max-width: 500px;
  margin: 1rem;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
