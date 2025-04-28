<template>
  <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
    <v-card-title class="chart-title">
      <div class="d-flex align-center">
        <v-icon start icon="mdi-chart-line" color="primary"></v-icon>
        <span class="ml-2">线速度图表</span>
      </div>
      <v-tooltip location="top" text="线速度变化趋势">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" icon="mdi-information" size="small" color="grey"></v-icon>
        </template>
      </v-tooltip>
    </v-card-title>
    <v-card-text class="chart-container">
      <div id="linearSpeedChart" class="chart chart-animated"></div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import ROSLIB from 'roslib'
import * as echarts from 'echarts'

const { rosUrl, topicName } = defineProps({
  rosUrl: {
    type: String,
    default: 'ws://localhost:9090/',
  },
  topicName: {
    type: String,
    default: '/cmd_vel',
  },
})

const connectionStatus = ref(false)
const speedList = ref([])
const timeStamp = ref([])
const maxDataNum = 500
let ros
let speedTopic

const connectToRos = () => {
  // 如果连接，则应该先关闭连接
  if (ros) {
    ros.close()
    connectionStatus.value = false
  }
  // 创建新的连接
  ros = new ROSLIB.Ros({
    url: rosUrl,
  })

  ros.on('connection', () => {
    console.log('成功连接到ros websocket服务器')
    connectionStatus.value = true
    subscribeTopic()
  })

  ros.on('error', (err) => {
    console.log('ros连接失败，错误为：', err)
    connectionStatus.value = false
  })

  ros.on('close', () => {
    console.log('ros连接已结束')
    connectionStatus.value = false
  })
}

const subscribeTopic = () => {
  speedTopic = new ROSLIB.Topic({
    ros,
    name: topicName,
    messageType: 'geometry/Twist',
  })

  speedTopic.subscribe((message) => {
    timeStamp.value.push(Date.now())
  })
}
</script>

<style lang="scss" scoped></style>
