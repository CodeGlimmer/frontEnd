<template>
  <v-card class="quick-commands-card">
    <v-card-item>
      <v-card-title class="text-subtitle-1">快速指令</v-card-title>
    </v-card-item>
    <v-card-text class="pt-0">
      <v-btn-group variant="outlined" density="comfortable">
        <v-btn prepend-icon="mdi-refresh" @click="handleRefreshMap">刷新地图</v-btn>
        <v-btn prepend-icon="mdi-home" @click="handleReturnToOrigin">返回原点</v-btn>
        <v-btn prepend-icon="mdi-stop" @click="handleEmergencyStop">急停</v-btn>
      </v-btn-group>
    </v-card-text>
  </v-card>
</template>

<script setup>
import ROSLIB from 'roslib'
import { onUnmounted } from 'vue'

const { rosUrl } = defineProps({
  rosUrl: {
    type: String,
    default: 'ws://0.0.0.0:9091',
  },
})

let topic = null
let message = null

const ros = new ROSLIB.Ros({
  url: rosUrl,
})

ros.on('connection', () => {
  topic ??= new ROSLIB.Topic({
    ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist',
  })
  message ??= new ROSLIB.Message({
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  })
})

// 按钮事件处理函数
const handleRefreshMap = () => {
  // TODO: 实现刷新地图逻辑
  console.log('刷新地图')
}

const handleReturnToOrigin = () => {
  // TODO: 实现返回原点逻辑
  console.log('返回原点')
}

const handleEmergencyStop = () => {
  if (topic) {
    topic.publish(message)
    console.log('急停')
  } else {
    console.log('ros连接失败')
  }
}

onUnmounted(() => {
  if (!topic) {
    ros.close()
  }
})
</script>

<style scoped>
.quick-commands-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  will-change: transform, box-shadow;
}

.quick-commands-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
</style>
