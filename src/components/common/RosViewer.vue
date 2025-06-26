<template>
  <div class="ros-video-viewer">
    <canvas ref="videoCanvas" class="video-canvas transition-all duration-300"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import ROSLIB from 'roslib'

// 定义props
const props = defineProps({
  wsUrl: {
    type: String,
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  startVideo: {
    type: Boolean,
    default: false,
  },
})

// 定义emits
const emit = defineEmits([
  'connection-change',
  'connection-error',
  'viewing-change',
  'topic-error',
  'status-update',
])

const videoCanvas = useTemplateRef('videoCanvas')
const connectionStatus = ref('initializing')
const isViewing = ref(false)
let ros = null
let imageListener = null

const updateStatusMessage = (message) => {
  emit('status-update', message)
}

const clearCanvas = () => {
  const canvas = videoCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#888'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = '20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('等待视频画面...', canvas.width / 2, canvas.height / 2)
}

const connectToRos = () => {
  if (!props.wsUrl) {
    updateStatusMessage('WebSocket URL 不能为空')
    connectionStatus.value = 'error'
    emit('connection-error', { type: 'invalid_url', message: 'WebSocket URL 不能为空' })
    return
  }

  ros = new ROSLIB.Ros({ url: props.wsUrl })

  ros.on('connection', () => {
    connectionStatus.value = 'connected'
    if (props.startVideo) {
      startVideoStream()
    }
  })

  ros.on('error', (error) => {
    updateStatusMessage(`连接错误: ${error.toString()}`)
    connectionStatus.value = 'error'
    emit('connection-error', { type: 'connection_error', message: error.toString() })
  })

  ros.on('close', () => {
    connectionStatus.value = 'closed'
    stopVideoStream()
  })
}

const startVideoStream = () => {
  if (!ros || connectionStatus.value !== 'connected') {
    updateStatusMessage('无法启动视频流: 未连接到ROS')
    emit('viewing-change', false)
    return
  }

  if (!props.topicName) {
    updateStatusMessage('无法启动视频流: Topic名称不能为空')
    emit('topic-error', { type: 'empty_topic', message: 'Topic名称不能为空' })
    return
  }

  const isCompressed = props.topicName.includes('compressed')
  const messageType = isCompressed ? 'sensor_msgs/CompressedImage' : 'sensor_msgs/Image'

  imageListener = new ROSLIB.Topic({
    ros: ros,
    name: props.topicName,
    messageType: messageType,
  })

  imageListener.subscribe((message) => {
    const canvas = videoCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (isCompressed) {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
      }
      img.src = 'data:image/jpeg;base64,' + message.data
    } else {
      // 处理非压缩数据
      const { width, height, data: rawData } = message
      const imageData = ctx.createImageData(width, height)
      const buffer = imageData.data
      // TODO 实现了视屏画面的显示，但是颜色配置异常，需要调整
      for (let idx = 0; idx < rawData.length; idx += 4) {
        buffer[idx + 3] = rawData[idx + 3].charCodeAt()
        buffer[idx + 2] = rawData[idx].charCodeAt()
        buffer[idx + 1] = rawData[idx + 1].charCodeAt()
        buffer[idx] = rawData[idx + 2].charCodeAt()
      }

      canvas.width = width
      canvas.height = height
      ctx.putImageData(imageData, 0, 0)
    }

    isViewing.value = true
    emit('viewing-change', true)
  })
}

const stopVideoStream = () => {
  if (imageListener) {
    imageListener.unsubscribe()
    imageListener = null
  }

  isViewing.value = false
  clearCanvas()
}

watch(
  () => props.wsUrl,
  (newUrl) => {
    if (newUrl) {
      connectToRos()
    }
  },
)

watch(
  () => props.topicName,
  (newTopic) => {
    if (isViewing.value) {
      stopVideoStream()
      if (newTopic && connectionStatus.value === 'connected') {
        startVideoStream()
      }
    }
  },
)

watch(
  () => props.startVideo,
  (shouldStart) => {
    if (shouldStart && !isViewing.value && connectionStatus.value === 'connected') {
      startVideoStream()
    } else if (!shouldStart && isViewing.value) {
      stopVideoStream()
    }
  },
)

onMounted(() => {
  clearCanvas()
  if (props.wsUrl) {
    connectToRos()
  } else {
    updateStatusMessage('请提供WebSocket URL')
  }
})

onBeforeUnmount(() => {
  stopVideoStream()
  if (ros) {
    ros.close()
    ros = null
  }
})
</script>

<style scoped>
.ros-video-viewer {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.video-canvas {
  width: auto;
  height: auto;
  aspect-ratio: 4 / 3; /* 固定比例，您可以根据需要调整 */
  border: 1px solid #ddd;
  background-color: #eee;
  display: block;
  margin: 0 auto;
}
</style>
