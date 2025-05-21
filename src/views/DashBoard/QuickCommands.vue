<template>
  <v-card v-motion :initial="motionConfig.initial" :enter="motionConfig.enter">
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
// 动画配置
const motionConfig = {
  initial: { opacity: 0, y: 50 },
  enter: { opacity: 1, y: 0, transition: { duration: 500, delay: 800 } },
}

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
  // TODO: 实现急停逻辑
  console.log('急停')
}
</script>
