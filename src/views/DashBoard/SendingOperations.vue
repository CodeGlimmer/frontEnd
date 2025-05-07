<template>
  <div>
    <KeyBoard :dark-mode="isDarkMode" @key-state-change="" />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores'
import { VelControl } from '@/lib/rosConnection'

import KeyBoard from '@/components/KeyBoard.vue'

// 获取到父组件传过来的linear与angular参数
const { linear, angular } = defineProps({
  linear: {
    type: Number,
    default: 0.5,
  },
  angular: {
    type: Number,
    default: 0.2,
  },
})

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
</script>

<style lang="scss" scoped></style>
