<template>
  <div class="floating-orb-container">
    <!-- 主悬浮球 -->
    <div
      ref="orbRef"
      class="floating-orb"
      :class="{
        recording: isRecording,
        thinking: isThinking,
        answering: isAnswering,
      }"
      @click="handleClick"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    >
      <!-- 背景渐变和光晕效果 -->
      <div class="orb-background"></div>
      <div class="orb-glow" ref="glowRef"></div>

      <!-- 主图标 -->
      <v-icon
        ref="iconRef"
        :icon="currentIcon"
        :size="orbSize === 'large' ? 32 : 24"
        color="white"
        class="orb-icon"
      />

      <!-- 录音时的声波动画 -->
      <div v-if="isRecording" class="sound-waves">
        <div
          v-for="i in 3"
          :key="i"
          class="sound-wave"
          :style="{ animationDelay: `${i * 0.2}s` }"
        ></div>
      </div>

      <!-- 思考时的粒子效果 -->
      <div v-if="isThinking" class="thinking-particles">
        <div v-for="i in 8" :key="i" class="particle" ref="particleRefs"></div>
      </div>
    </div>

    <!-- 长按菜单 -->
    <transition name="menu-fade">
      <div v-if="showMenu" class="floating-menu" ref="menuRef">
        <div class="menu-items">
          <div
            v-for="(item, index) in menuItems"
            :key="item.id"
            :ref="(el) => setMenuItemRef(el, index)"
            class="menu-item"
            @click="handleMenuClick(item)"
          >
            <v-btn
              :icon="item.icon"
              :color="item.color"
              size="large"
              variant="elevated"
              class="menu-btn"
            />
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- DeepSeek 回答窗口 - 修改位置为左侧 -->
    <transition name="answer-slide">
      <div v-if="showAnswerWindow" class="answer-window" ref="answerWindowRef">
        <v-card class="answer-card" elevation="24" rounded="xl">
          <v-card-title class="answer-header">
            <v-icon left color="white">mdi-robot</v-icon>
            DeepSeek 回答
            <v-spacer />
            <v-btn
              @click="closeAnswerWindow"
              icon="mdi-close"
              size="small"
              variant="text"
              density="compact"
              color="white"
            />
          </v-card-title>

          <v-card-text class="answer-content">
            <div v-if="isThinking" class="thinking-indicator">
              <v-progress-circular indeterminate size="20" width="2" color="primary" class="mr-2" />
              <span>正在思考...</span>
            </div>

            <div
              v-else-if="currentAnswer"
              ref="answerTextRef"
              class="answer-text"
              v-html="formatAnswer(currentAnswer)"
            ></div>

            <div v-else class="no-answer">
              <v-icon color="outline" size="48">mdi-chat-question</v-icon>
              <p>暂无回答</p>
            </div>
          </v-card-text>

          <v-card-actions class="answer-actions">
            <v-btn
              @click="copyAnswer"
              prepend-icon="mdi-content-copy"
              variant="text"
              size="small"
              :disabled="!currentAnswer"
            >
              复制
            </v-btn>
            <v-spacer />
            <v-btn @click="closeAnswerWindow" color="primary" variant="elevated" size="small">
              关闭
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </transition>

    <!-- 通知 -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      timeout="3000"
      location="bottom center"
    >
      {{ notification.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { formatMessage } from '../ChatAI/chatService.js'
import { useFloatingOrb, FloatingOrbDeepSeekService } from '@/composables/useFloatingOrb'

// 路由
const router = useRouter()

// 组件引用
const orbRef = ref(null)
const glowRef = ref(null)
const iconRef = ref(null)
const menuRef = ref(null)
const answerWindowRef = ref(null)
const answerTextRef = ref(null)
const particleRefs = ref([])
const menuItemRefs = ref([])

// 状态管理
const isRecording = ref(false)
const isThinking = ref(false)
const isAnswering = ref(false)
const showMenu = ref(false)
const showAnswerWindow = ref(false)
const orbSize = ref('normal') // normal | large

// 长按相关
const longPressTimer = ref(null)
const isLongPress = ref(false)
const LONG_PRESS_DURATION = 800

// 语音识别
const speechRecognition = ref(null)
const speechSupported = ref(false)

// 回答相关
const currentAnswer = ref('')
const notification = ref({
  show: false,
  message: '',
  type: 'info',
})

// 菜单项配置
const menuItems = ref([
  { id: 'chat', label: 'AI聊天', icon: 'mdi-chat', color: 'primary', route: '/chat-ai' },
  {
    id: 'dashboard',
    label: '仪表板',
    icon: 'mdi-view-dashboard',
    color: 'success',
    route: '/dashboard',
  },
  { id: 'settings', label: '设置', icon: 'mdi-cog', color: 'warning', route: '/settings' },
  { id: 'profile', label: '个人', icon: 'mdi-account', color: 'info', route: '/profile' },
  { id: 'help', label: '帮助', icon: 'mdi-help-circle', color: 'secondary', route: '/help' },
])

const { orbConfig } = useFloatingOrb()

// 计算属性
const currentIcon = computed(() => {
  if (isRecording.value) return 'mdi-microphone'
  if (isThinking.value) return 'mdi-brain'
  if (isAnswering.value) return 'mdi-robot'
  return 'mdi-microphone-outline'
})

// 语音识别初始化
const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    speechSupported.value = false
    return
  }

  speechSupported.value = true
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  speechRecognition.value = new SpeechRecognition()

  speechRecognition.value.continuous = false
  speechRecognition.value.interimResults = false
  speechRecognition.value.lang = 'zh-CN'

  speechRecognition.value.onstart = () => {
    playRecordingAnimation()
  }

  speechRecognition.value.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    if (transcript.trim()) {
      sendToDeepSeek(transcript)
    }
  }

  speechRecognition.value.onend = () => {
    stopRecordingAnimation()
  }

  speechRecognition.value.onerror = (event) => {
    stopRecordingAnimation()
    showNotification(`语音识别错误: ${event.error}`, 'error')
  }
}

// 事件处理
const handleClick = () => {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }

  if (!speechSupported.value) {
    showNotification('您的浏览器不支持语音识别', 'warning')
    return
  }

  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const handleTouchStart = (e) => {
  e.preventDefault()
  startLongPressDetection()
}

const handleTouchEnd = (e) => {
  e.preventDefault()
  endLongPressDetection()
}

const handleMouseDown = () => {
  startLongPressDetection()
}

const handleMouseUp = () => {
  endLongPressDetection()
}

const handleMouseLeave = () => {
  endLongPressDetection()
}

const startLongPressDetection = () => {
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    showLongPressMenu()
  }, LONG_PRESS_DURATION)

  // 开始长按动画
  gsap.to(orbRef.value, {
    duration: LONG_PRESS_DURATION / 1000,
    scale: 1.1,
    ease: 'power2.out',
  })
}

const endLongPressDetection = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  if (!isLongPress.value) {
    // 恢复正常大小
    gsap.to(orbRef.value, {
      duration: 0.3,
      scale: 1,
      ease: 'back.out(1.7)',
    })
  }
}

const showLongPressMenu = () => {
  showMenu.value = true
  playMenuAnimation()
  playHapticFeedback()
}

const hideMenu = () => {
  if (showMenu.value) {
    gsap.to(menuRef.value, {
      duration: 0.3,
      scale: 0,
      opacity: 0,
      ease: 'back.in(1.7)',
      onComplete: () => {
        showMenu.value = false
      },
    })
  }
}

const handleMenuClick = (item) => {
  hideMenu()
  setTimeout(() => {
    if (item.route) {
      router.push(item.route)
    }
  }, 300)
}

// 录音相关
const startRecording = () => {
  if (!speechRecognition.value) return

  try {
    isRecording.value = true
    speechRecognition.value.start()
    showNotification('开始录音...', 'info')
  } catch (error) {
    isRecording.value = false
    showNotification('录音启动失败', 'error')
  }
}

const stopRecording = () => {
  if (speechRecognition.value && isRecording.value) {
    speechRecognition.value.stop()
    isRecording.value = false
  }
}

// DeepSeek API 调用
const sendToDeepSeek = async (message) => {
  isThinking.value = true
  orbSize.value = 'large'
  playThinkingAnimation()

  try {
    // 使用真实的 DeepSeek API
    const service = new FloatingOrbDeepSeekService(orbConfig.deepseek)
    const response = await service.sendMessage(message)

    currentAnswer.value = response
    showAnswerWindow.value = true
    isAnswering.value = true

    await nextTick()
    playAnswerAnimation()
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error)
    showNotification(`AI 回答失败: ${error.message}`, 'error')
  } finally {
    isThinking.value = false
    orbSize.value = 'normal'
  }
}

const closeAnswerWindow = () => {
  gsap.to(answerWindowRef.value, {
    duration: 0.4,
    y: 50,
    opacity: 0,
    ease: 'power2.in',
    onComplete: () => {
      showAnswerWindow.value = false
      isAnswering.value = false
      currentAnswer.value = ''
    },
  })
}

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(currentAnswer.value)
    showNotification('回答已复制到剪贴板', 'success')
  } catch (error) {
    showNotification('复制失败', 'error')
  }
}

const formatAnswer = (text) => {
  return formatMessage(text)
}

// 动画相关
const playRecordingAnimation = () => {
  // 悬浮球呼吸效果
  gsap.to(orbRef.value, {
    duration: 0.8,
    scale: 1.2,
    ease: 'power2.out',
  })

  // 光晕效果
  gsap.to(glowRef.value, {
    duration: 0.5,
    scale: 2,
    opacity: 0.8,
    ease: 'power2.out',
  })

  // 图标旋转
  gsap.to(iconRef.value.$el, {
    duration: 0.3,
    rotationY: 180,
    ease: 'power2.out',
  })
}

const stopRecordingAnimation = () => {
  gsap.to(orbRef.value, {
    duration: 0.5,
    scale: 1,
    ease: 'back.out(1.7)',
  })

  gsap.to(glowRef.value, {
    duration: 0.3,
    scale: 1,
    opacity: 0.3,
    ease: 'power2.out',
  })

  gsap.to(iconRef.value.$el, {
    duration: 0.3,
    rotationY: 0,
    ease: 'power2.out',
  })
}

const playThinkingAnimation = () => {
  // 粒子动画
  nextTick(() => {
    particleRefs.value.forEach((particle, index) => {
      if (particle) {
        gsap.set(particle, {
          x: 0,
          y: 0,
          scale: 0,
          opacity: 0,
        })

        gsap.to(particle, {
          duration: 2,
          x: Math.cos((index * 45 * Math.PI) / 180) * 60,
          y: Math.sin((index * 45 * Math.PI) / 180) * 60,
          scale: 1,
          opacity: 1,
          ease: 'power2.out',
          repeat: -1,
          yoyo: true,
          delay: index * 0.1,
        })
      }
    })
  })

  // 悬浮球缓慢旋转
  gsap.to(orbRef.value, {
    duration: 3,
    rotation: 360,
    ease: 'none',
    repeat: -1,
  })
}

const playMenuAnimation = () => {
  gsap.set(menuRef.value, { scale: 0, opacity: 0 })

  gsap.to(menuRef.value, {
    duration: 0.5,
    scale: 1,
    opacity: 1,
    ease: 'back.out(1.7)',
  })

  // 菜单项依次出现
  menuItemRefs.value.forEach((item, index) => {
    if (item) {
      gsap.set(item, { scale: 0, opacity: 0 })
      gsap.to(item, {
        duration: 0.4,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)',
        delay: index * 0.1,
      })
    }
  })
}

const playAnswerAnimation = () => {
  if (answerTextRef.value) {
    gsap.fromTo(
      answerTextRef.value,
      { opacity: 0, y: 20 },
      { duration: 0.6, opacity: 1, y: 0, ease: 'power2.out' },
    )
  }
}

const playHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

// 工具函数
const setMenuItemRef = (el, index) => {
  if (el) {
    menuItemRefs.value[index] = el
  }
}

const showNotification = (message, type = 'info') => {
  notification.value = {
    show: true,
    message,
    type,
  }
}

// 生命周期
onMounted(() => {
  initSpeechRecognition()

  // 入场动画
  gsap.fromTo(
    orbRef.value,
    { scale: 0, opacity: 0 },
    { duration: 0.8, scale: 1, opacity: 1, ease: 'back.out(1.7)' },
  )

  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    if (showMenu.value && !orbRef.value?.contains(e.target) && !menuRef.value?.contains(e.target)) {
      hideMenu()
    }
  })
})

onUnmounted(() => {
  if (speechRecognition.value) {
    speechRecognition.value.stop()
  }
  gsap.killTweensOf('*')
})
</script>

<style scoped>
.floating-orb-container {
  position: fixed;
  bottom: 80px;
  right: 30px;
  z-index: 9999;
  pointer-events: none;
}

.floating-orb {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.floating-orb.large {
  width: 80px;
  height: 80px;
}

.orb-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  z-index: 1;
}

.floating-orb.recording .orb-background {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.floating-orb.thinking .orb-background {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.floating-orb.answering .orb-background {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
}

.orb-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
  opacity: 0.3;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.orb-icon {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.sound-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.sound-wave {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: sound-wave-pulse 1.5s ease-out infinite;
  top: -40px;
  left: -40px;
}

@keyframes sound-wave-pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.thinking-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.floating-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  pointer-events: auto;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.menu-btn {
  pointer-events: none;
}

.menu-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.answer-window {
  position: absolute;
  bottom: calc(100% + 16px); /* 显示在悬浮球上方，间距16px */
  right: 0; /* 对话框右边缘与悬浮球右边缘对齐 */
  transform: none;
  width: v-bind('orbConfig.dialog.width + "px"');
  max-width: v-bind('orbConfig.dialog.maxWidth');
  max-height: v-bind('orbConfig.dialog.maxHeight');
  pointer-events: auto;
  z-index: 10001;

  /* 确保不超出视口左边界 */
  min-width: 300px;
}

/* 响应式调整 - 小屏设备 */
@media (max-width: 768px) {
  .answer-window {
    /* 小屏设备时，对话框居中显示 */
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    z-index: 10001;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .answer-window {
    width: 350px;
    max-width: 80vw;
    /* 确保在平板上不会超出左边界 */
    right: 0;
    transform: translateX(calc(-100% + 64px)); /* 向左偏移，但保持部分重叠 */
  }
}

/* 当悬浮球靠近顶部时，对话框切换到下方 */
@media (min-width: 769px) {
  .floating-orb-container.near-top-edge .answer-window {
    bottom: auto;
    top: calc(100% + 16px); /* 切换到下方 */
  }
}

/* 当悬浮球靠近右边缘时，对话框向左偏移更多 */
@media (min-width: 769px) {
  .floating-orb-container.near-right-edge .answer-window {
    right: 0;
    transform: translateX(-100%); /* 完全向左偏移 */
  }
}

.answer-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.answer-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 16px 20px;
}

.answer-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 24px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.thinking-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
}

.answer-text {
  line-height: 1.6;
  color: #333;
  font-size: 14px;

  /* 改进的代码样式 */
  :deep(code) {
    background: #f8f9fa;
    color: #e83e8c;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    border: 1px solid #e9ecef;
  }

  :deep(pre) {
    background: #f8f9fa;
    color: #333;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
    border: 1px solid #e9ecef;
    font-size: 13px;

    code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
    }
  }

  :deep(p) {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 12px 0;
    padding-left: 20px;
  }

  :deep(blockquote) {
    border-left: 4px solid #667eea;
    margin: 12px 0;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 0 4px 4px 0;
  }
}

.no-answer {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.answer-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0 0 12px 12px;
}

/* 过渡动画优化 - 适配新位置 */
.answer-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.answer-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.answer-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.answer-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 移动设备的动画保持不变 */
@media (max-width: 768px) {
  .answer-slide-enter-from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }

  .answer-slide-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .answer-card {
    background: rgba(40, 40, 40, 0.98);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .answer-text {
    color: #f0f0f0;

    :deep(code) {
      background: rgba(255, 255, 255, 0.1);
      color: #ff6b9d;
      border-color: rgba(255, 255, 255, 0.2);
    }

    :deep(pre) {
      background: rgba(255, 255, 255, 0.05);
      color: #f0f0f0;
      border-color: rgba(255, 255, 255, 0.1);
    }

    :deep(blockquote) {
      background: rgba(102, 126, 234, 0.1);
      color: #e0e0e0;
    }
  }

  .answer-actions {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
