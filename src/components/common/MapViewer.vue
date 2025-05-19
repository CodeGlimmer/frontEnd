<template>
  <div :id="mapId" class="tw:aspect-video"></div>
</template>

<script setup>
import * as ROSLIB from 'roslib'
import * as ROS2D from '@/lib/stdros/ros2d.js'
import { onMounted, onBeforeUnmount, ref, useId } from 'vue'

const { rosUrl } = defineProps({
  rosUrl: {
    type: String,
    default: 'ws://localhost:9090',
  },
})

const ros = ref(null)
const viewer = ref(null)
const gridClient = ref(null)
const mapId = useId()

onMounted(() => {
  init()
})

function init() {
  // 连接 ROS
  ros.value = new ROSLIB.Ros({
    url: rosUrl,
  })

  // 创建主视图
  viewer.value = new ROS2D.Viewer({
    divID: mapId,
    width: 640,
    height: 480,
  })

  // 设置地图客户端
  gridClient.value = new ROS2D.OccupancyGridClient({
    ros: ros.value,
    rootObject: viewer.value.scene,
  })

  // 缩放画布以适应地图
  gridClient.value.on('change', () => {
    viewer.value.scaleToDimensions(
      gridClient.value.currentGrid.width,
      gridClient.value.currentGrid.height,
    )
    viewer.value.shift(
      gridClient.value.currentGrid.pose.position.x,
      gridClient.value.currentGrid.pose.position.y,
    )
  })
}

onBeforeUnmount(() => {
  // 清理资源
  if (gridClient.value) {
    gridClient.value.unsubscribe()
  }
  if (ros.value) {
    ros.value.close()
  }
})
</script>
