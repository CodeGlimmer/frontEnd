<template>
  <div>
    <KeyBoard :dark-mode="isDarkMode" @key-state-change="updateKeyState" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores'
import { Controler } from '@/lib/rosConnection'

import KeyBoard from '@/components/KeyBoard.vue'

// 获取到父组件传过来的linear与angular参数
const { linear, angular, rosUrl } = defineProps({
  linear: {
    type: Number,
    default: 1,
  },
  angular: {
    type: Number,
    default: 0.2,
  },
  rosUrl: {
    type: String,
    default: 'ws://0.0.0.0:9091',
  },
})

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
let controler

const updateKeyState = (newKeyState) => {
  controler.updateKeyState(newKeyState)
}

onMounted(() => {
  controler = new Controler({ linear, angular, rosUrl })
})

onUnmounted(() => {
  controler.dispose()
})
</script>

<style lang="scss" scoped></style>
