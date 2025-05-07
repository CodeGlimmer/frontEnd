<template>
  <div class="keyboard-container" :class="{ 'dark-mode': darkMode }">
    <div class="keyboard">
      <div class="key-row">
        <div
          v-for="key in keys.slice(0, 1)"
          :key="key.id"
          class="key"
          :class="{ active: activeKeys.includes(key.id) }"
          @mousedown="handleKeyDown(key.id)"
          @mouseup="handleKeyUp(key.id)"
          @touchstart.prevent="handleKeyDown(key.id)"
          @touchend.prevent="handleKeyUp(key.id)"
        >
          <span>{{ key.label }}</span>
        </div>
      </div>
      <div class="key-row">
        <div
          v-for="key in keys.slice(1, 4)"
          :key="key.id"
          class="key"
          :class="{ active: activeKeys.includes(key.id) }"
          @mousedown="handleKeyDown(key.id)"
          @mouseup="handleKeyUp(key.id)"
          @touchstart.prevent="handleKeyDown(key.id)"
          @touchend.prevent="handleKeyUp(key.id)"
        >
          <span>{{ key.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 定义 props
const { darkMode } = defineProps({
  darkMode: {
    type: Boolean,
    default: true,
  },
})

// 定义 emit 事件
const emit = defineEmits(['key-state-change'])

// 键盘配置
const keys = ref([
  { id: 'w', label: 'W' },
  { id: 'a', label: 'A' },
  { id: 's', label: 'S' },
  { id: 'd', label: 'D' },
])

// 当前激活的按键
const activeKeys = ref([])
let intervalId = null

// 事件触发函数
const emitKeyStateChange = () => {
  const keyOrder = ['a', 's', 'd', 'w']
  const keyState = keyOrder.map((key) => activeKeys.value.includes(key))
  emit('key-state-change', keyState)
}

// 按键按下处理
const handleKeyDown = (keyId) => {
  if (!activeKeys.value.includes(keyId)) {
    activeKeys.value.push(keyId)
    startLongPressAnimation(keyId)
    emitKeyStateChange()
  }
}

// 按键释放处理
const handleKeyUp = (keyId) => {
  activeKeys.value = activeKeys.value.filter((key) => key !== keyId)
  stopLongPressAnimation()
  emitKeyStateChange()
}

// 长按动画
const startLongPressAnimation = (keyId) => {
  intervalId = setInterval(() => {
    console.log(`Long press ${keyId}`)
  }, 100)
}

const stopLongPressAnimation = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// 键盘事件处理
const handleKeyboardInput = (event) => {
  const key = event.key.toLowerCase()
  const validKeys = ['w', 'a', 's', 'd']
  if (validKeys.includes(key)) {
    event.preventDefault()
    if (event.type === 'keydown') {
      handleKeyDown(key)
    } else {
      handleKeyUp(key)
    }
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('keydown', handleKeyboardInput)
  window.addEventListener('keyup', handleKeyboardInput)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardInput)
  window.removeEventListener('keyup', handleKeyboardInput)
})
</script>

<style scoped>
/* 保持原有样式不变 */
.keyboard-container {
  --bg-color: #f5f5f5;
  --key-bg: #ffffff;
  --key-active-bg: #eeeeee;
  --text-color: #333333;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --keyboard-bg: #dddddd;

  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}

.keyboard-container.dark-mode {
  --bg-color: #2d2d2d;
  --key-bg: #444444;
  --key-active-bg: #666666;
  --text-color: #ffffff;
  --shadow-color: rgba(255, 255, 255, 0.1);
  --keyboard-bg: #3a3a3a;
}

.keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--keyboard-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 20px;
  transition: all 0.3s ease;
}

.key-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.key {
  width: 80px;
  height: 80px;
  background-color: var(--key-bg);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px var(--shadow-color);
}

.key.active {
  background-color: var(--key-active-bg);
  transform: translateY(2px);
  box-shadow: 0 1px 3px var(--shadow-color);
}

.key span {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .key {
    width: 60px;
    height: 60px;
  }

  .key span {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .key {
    width: 50px;
    height: 50px;
  }

  .key span {
    font-size: 16px;
  }
}
</style>
