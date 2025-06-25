<template>
  <div class="floating-orb-container" :class="{ 'hidden-mode': isHidden }">
    <!-- 主悬浮球 -->
    <div
      ref="orbRef"
      class="floating-orb"
      :class="{
        recording: isRecording,
        thinking: isThinking,
        answering: isAnswering,
        swiping: isSwipeInProgress,
        hidden: isHidden,
      }"
      @click="handleClick"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
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

      <!-- 滑动提示 -->
      <div v-if="showSwipeHint && isMobile" class="swipe-hint">
        <v-icon size="16" color="white">mdi-gesture-swipe-left</v-icon>
        <span>左滑录音</span>
      </div>

      <!-- 隐藏状态提示 -->
      <div v-if="isHidden" class="hidden-hint">
        <v-icon size="12" color="white">mdi-eye-off</v-icon>
      </div>
    </div>

    <!-- 移动端滑动指示器 -->
    <div v-if="isMobile && isSwipeInProgress" class="swipe-indicator">
      <div class="swipe-progress" :style="{ width: swipeProgress + '%' }"></div>
      <span class="swipe-text">{{ swipeProgress >= 100 ? '松开录音' : '继续左滑' }}</span>
    </div>

    <!-- 移动端上滑指示器 -->
    <div v-if="isMobile && isUpSwipeInProgress" class="upswipe-indicator">
      <div class="upswipe-progress" :style="{ height: upSwipeProgress + '%' }"></div>
      <span class="upswipe-text">{{ upSwipeProgress >= 100 ? '松开隐藏' : '继续上滑' }}</span>
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

    <!-- 快捷键提示（仅桌面端） -->
    <div v-if="!isMobile && !isTablet" class="keyboard-hint" :class="{ show: showKeyboardHint }">
      <v-icon size="16" color="white">mdi-keyboard</v-icon>
      <span>Ctrl + Shift + H 隐藏/显示悬浮球</span>
    </div>
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
  { id: 'chat', label: 'AI聊天', icon: 'mdi-chat', color: 'primary', route: '/index/chatai' },
  {
    id: 'dashboard',
    label: '仪表板',
    icon: 'mdi-view-dashboard',
    color: 'success',
    route: '/index',
  },
  { id: 'settings', label: '设置', icon: 'mdi-cog', color: 'warning', route: '/index/setting' },
  { id: 'profile', label: '监控', icon: 'mdi-eye', color: 'info', route: '/index/agvmonitoring' },
  {
    id: 'help',
    label: 'fox glove',
    icon: 'mdi-help-circle',
    color: 'secondary',
    route: '/index/agvmonitoring/foxglove',
  },
])

const { orbConfig } = useFloatingOrb()

// 设备检测
const isMobile = ref(false)
const isTablet = ref(false)

// 滑动相关
const isSwipeInProgress = ref(false)
const swipeStartX = ref(0)
const swipeStartY = ref(0)
const swipeCurrentX = ref(0)
const swipeCurrentY = ref(0)
const swipeProgress = ref(0)
const showSwipeHint = ref(false)
const SWIPE_THRESHOLD = 80 // 滑动阈值
const VERTICAL_TOLERANCE = 30 // 垂直容差

// 上滑相关（移动端隐藏功能）
const isUpSwipeInProgress = ref(false)
const upSwipeStartY = ref(0)
const upSwipeCurrentY = ref(0)
const upSwipeProgress = ref(0)
const UP_SWIPE_THRESHOLD = 60 // 上滑阈值

// 隐藏功能相关
const isHidden = ref(false)
const showKeyboardHint = ref(false)

// 计算属性
const currentIcon = computed(() => {
  if (isRecording.value) return 'mdi-microphone'
  if (isThinking.value) return 'mdi-brain'
  if (isAnswering.value) return 'mdi-robot'
  return 'mdi-microphone-outline'
})

// 设备检测函数
const detectDevice = () => {
  const userAgent = navigator.userAgent
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // 更精确的移动设备检测 - 只有真正的手机才使用滑动交互
  isMobile.value =
    isTouchDevice && /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  isTablet.value =
    isTouchDevice &&
    (/iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)))

  // 首次加载时显示滑动提示（仅手机）
  if (isMobile.value) {
    showSwipeHint.value = true
    setTimeout(() => {
      showSwipeHint.value = false
    }, 3000)
  }

  // 桌面端显示快捷键提示
  if (!isMobile.value && !isTablet.value) {
    setTimeout(() => {
      showKeyboardHint.value = true
      setTimeout(() => {
        showKeyboardHint.value = false
      }, 5000)
    }, 2000)
  }
}

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

// 录音相关
const startRecording = () => {
  if (!speechRecognition.value) return

  try {
    isRecording.value = true
    speechRecognition.value.start()
    showNotification('开始录音...', 'info')
  } catch {
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

// 移动端录音切换
const toggleRecordingMobile = () => {
  if (!speechSupported.value) {
    showNotification('您的设备不支持语音识别', 'warning')
    return
  }

  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 长按检测相关函数
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
        // 重置长按状态
        isLongPress.value = false
        gsap.to(orbRef.value, {
          duration: 0.3,
          scale: 1,
          ease: 'back.out(1.7)',
        })
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

// 重置滑动状态
const resetSwipe = () => {
  isSwipeInProgress.value = false
  swipeProgress.value = 0

  gsap.to(orbRef.value, {
    duration: 0.3,
    scale: 1,
    ease: 'back.out(1.7)',
  })
}

// 重置上滑状态
const resetUpSwipe = () => {
  isUpSwipeInProgress.value = false
  upSwipeProgress.value = 0

  gsap.to(glowRef.value, {
    duration: 0.3,
    opacity: 0.3,
    ease: 'power2.out',
  })
}

// 隐藏/显示切换
const toggleHiddenMode = () => {
  isHidden.value = !isHidden.value

  if (isHidden.value) {
    hideOrb()
  } else {
    showOrb()
  }
}

// 隐藏悬浮球
const hideOrb = () => {
  // 关闭所有弹出窗口
  if (showMenu.value) hideMenu()
  if (showAnswerWindow.value) closeAnswerWindow()

  playHapticFeedback()

  gsap.to(orbRef.value, {
    duration: 0.6,
    x: 40,
    y: 40,
    scale: 0.3,
    opacity: 0.6,
    ease: 'power2.inOut',
  })

  showNotification('悬浮球已隐藏，点击恢复', 'info')
}

// 显示悬浮球
const showOrb = () => {
  playHapticFeedback()

  gsap.to(orbRef.value, {
    duration: 0.6,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    ease: 'back.out(1.7)',
  })

  showNotification('悬浮球已恢复', 'success')
}

// 点击反馈动画
const playClickAnimation = () => {
  gsap.to(orbRef.value, {
    duration: 0.1,
    scale: 0.95,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(orbRef.value, {
        duration: 0.2,
        scale: 1,
        ease: 'back.out(1.7)',
      })
    },
  })

  // 光晕闪烁效果
  gsap.to(glowRef.value, {
    duration: 0.3,
    opacity: 0.8,
    scale: 1.3,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(glowRef.value, {
        duration: 0.5,
        opacity: 0.3,
        scale: 1,
        ease: 'power2.out',
      })
    },
  })
}

// 事件处理
const handleClick = () => {
  // 播放点击动画
  playClickAnimation()

  if (isHidden.value) {
    // 隐藏状态下点击恢复
    toggleHiddenMode()
    return
  }

  if (isLongPress.value) {
    isLongPress.value = false
    return
  }

  if (isMobile.value) {
    // 手机端：提示使用滑动手势
    showNotification('左滑录音，长按菜单，上滑隐藏', 'info')
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

  const touch = e.touches[0]
  swipeStartX.value = touch.clientX
  swipeStartY.value = touch.clientY
  swipeCurrentX.value = touch.clientX
  swipeCurrentY.value = touch.clientY
  swipeProgress.value = 0

  // 上滑检测初始化
  upSwipeStartY.value = touch.clientY
  upSwipeCurrentY.value = touch.clientY
  upSwipeProgress.value = 0

  if (isMobile.value) {
    // 手机端：启动滑动检测，同时启动长按检测（用于菜单）
    isSwipeInProgress.value = true
    isUpSwipeInProgress.value = true
    startLongPressDetection()
  } else {
    // 平板设备：只启动长按检测
    startLongPressDetection()
  }
}

const handleTouchMove = (e) => {
  e.preventDefault()

  const touch = e.touches[0]
  swipeCurrentX.value = touch.clientX
  swipeCurrentY.value = touch.clientY
  upSwipeCurrentY.value = touch.clientY

  if (isMobile.value) {
    const deltaX = swipeStartX.value - swipeCurrentX.value // 左滑为正值
    const deltaY = Math.abs(swipeStartY.value - swipeCurrentY.value)
    const upDeltaY = upSwipeStartY.value - upSwipeCurrentY.value // 上滑为正值

    // 如果有明显的滑动，取消长按检测
    if (Math.abs(deltaX) > 10 || deltaY > 10) {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }

    // 判断主要滑动方向
    if (Math.abs(upDeltaY) > Math.abs(deltaX)) {
      // 垂直滑动为主
      if (upDeltaY > 0) {
        // 上滑检测
        upSwipeProgress.value = Math.min((upDeltaY / UP_SWIPE_THRESHOLD) * 100, 100)

        // 重置左滑进度
        swipeProgress.value = 0
        resetSwipe()

        // 上滑视觉反馈
        const glowIntensity = 0.3 + (upSwipeProgress.value / 100) * 0.5
        gsap.to(glowRef.value, {
          duration: 0.1,
          opacity: glowIntensity,
          ease: 'power2.out',
        })

        // 达到阈值时的触觉反馈
        if (upSwipeProgress.value >= 100) {
          playHapticFeedback()
        }
      } else {
        // 下滑，重置所有
        upSwipeProgress.value = 0
        swipeProgress.value = 0
      }
    } else {
      // 水平滑动为主 - 原有左滑逻辑
      upSwipeProgress.value = 0

      // 检查是否为有效的左滑手势
      if (deltaY > VERTICAL_TOLERANCE) {
        // 垂直移动过多，取消滑动
        resetSwipe()
        return
      }

      if (deltaX > 0) {
        // 左滑进度
        swipeProgress.value = Math.min((deltaX / SWIPE_THRESHOLD) * 100, 100)

        // 视觉反馈
        const scale = 1 + (swipeProgress.value / 100) * 0.2
        gsap.to(orbRef.value, {
          duration: 0.1,
          scale: scale,
          ease: 'power2.out',
        })

        // 达到阈值时的触觉反馈
        if (swipeProgress.value >= 100 && !isRecording.value) {
          playHapticFeedback()
        }
      } else {
        // 右滑或无滑动
        swipeProgress.value = 0
      }
    }
  }
}

const handleTouchEnd = (e) => {
  e.preventDefault()

  if (isMobile.value) {
    // 检查上滑隐藏
    if (upSwipeProgress.value >= 100) {
      toggleHiddenMode()
    }
    // 检查左滑录音
    else if (swipeProgress.value >= 100 && !isLongPress.value) {
      toggleRecordingMobile()
    }

    resetSwipe()
    resetUpSwipe()
    endLongPressDetection()
  } else {
    // 平板设备：保持原有逻辑
    endLongPressDetection()
  }
}

// 鼠标事件处理（桌面端）
const handleMouseDown = () => {
  if (!isMobile.value && !isTablet.value) {
    startLongPressDetection()
  }
}

const handleMouseUp = () => {
  if (!isMobile.value && !isTablet.value) {
    endLongPressDetection()
  }
}

const handleMouseLeave = () => {
  if (!isMobile.value && !isTablet.value) {
    endLongPressDetection()
  }
}

// 键盘快捷键处理
const handleKeydown = (e) => {
  // Ctrl+Shift+H 切换隐藏状态（桌面端）
  if (e.ctrlKey && e.shiftKey && e.key === 'H' && !isMobile.value && !isTablet.value) {
    e.preventDefault()
    toggleHiddenMode()
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
    stopThinkingAnimation()
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
  } catch {
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
  // 悬浮球脉冲效果
  gsap.to(orbRef.value, {
    duration: 0.8,
    scale: 1.1,
    ease: 'power2.out',
  })

  // 光晕增强效果
  gsap.to(glowRef.value, {
    duration: 1,
    scale: 1.5,
    opacity: 0.8,
    ease: 'power2.out',
  })

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

        // 粒子向外扩散动画
        gsap.to(particle, {
          duration: 1.5,
          x: Math.cos((index * 45 * Math.PI) / 180) * 40,
          y: Math.sin((index * 45 * Math.PI) / 180) * 40,
          scale: 1,
          opacity: 0.8,
          ease: 'power2.out',
          delay: index * 0.1,
        })

        // 粒子呼吸效果
        gsap.to(particle, {
          duration: 1,
          scale: 1.5,
          opacity: 0.3,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.1 + 0.5,
        })
      }
    })
  })

  // 悬浮球缓慢旋转
  gsap.to(orbRef.value, {
    duration: 4,
    rotation: 360,
    ease: 'none',
    repeat: -1,
  })

  // 图标旋转效果
  gsap.to(iconRef.value.$el, {
    duration: 2,
    rotation: 360,
    ease: 'power2.inOut',
    repeat: -1,
  })
}

const stopThinkingAnimation = () => {
  // 停止悬浮球旋转
  gsap.killTweensOf(orbRef.value)

  // 停止图标旋转
  gsap.killTweensOf(iconRef.value.$el)

  // 停止粒子动画
  particleRefs.value.forEach((particle) => {
    if (particle) {
      gsap.killTweensOf(particle)
      gsap.set(particle, { opacity: 0, scale: 0 })
    }
  })

  // 恢复悬浮球状态
  gsap.to(orbRef.value, {
    duration: 0.5,
    scale: 1,
    rotation: 0,
    ease: 'power2.out',
  })

  // 恢复光晕状态
  gsap.to(glowRef.value, {
    duration: 0.3,
    scale: 1,
    opacity: 0.3,
    ease: 'power2.out',
  })

  // 恢复图标状态
  gsap.to(iconRef.value.$el, {
    duration: 0.3,
    rotation: 0,
    ease: 'power2.out',
  })
}

const playMenuAnimation = () => {
  // 菜单容器动画
  gsap.set(menuRef.value, {
    scale: 0,
    opacity: 0,
    rotation: -10,
    transformOrigin: 'bottom right',
  })

  gsap.to(menuRef.value, {
    duration: 0.6,
    scale: 1,
    opacity: 1,
    rotation: 0,
    ease: 'back.out(1.7)',
  })

  // 菜单项依次出现，带有更丰富的动画
  menuItemRefs.value.forEach((item, index) => {
    if (item) {
      gsap.set(item, {
        scale: 0,
        opacity: 0,
        x: 50,
        rotation: 15,
      })

      gsap.to(item, {
        duration: 0.5,
        scale: 1,
        opacity: 1,
        x: 0,
        rotation: 0,
        ease: 'back.out(1.7)',
        delay: index * 0.08,
      })

      // 添加悬停动画
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          duration: 0.3,
          scale: 1.05,
          x: -8,
          ease: 'power2.out',
        })
      })

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          duration: 0.3,
          scale: 1,
          x: 0,
          ease: 'power2.out',
        })
      })
    }
  })
}

const playAnswerAnimation = () => {
  // 回答窗口入场动画
  if (answerWindowRef.value) {
    gsap.fromTo(
      answerWindowRef.value,
      {
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotationX: -15,
      },
      {
        duration: 0.8,
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        ease: 'back.out(1.7)',
      },
    )
  }

  // 回答文本打字机效果
  if (answerTextRef.value) {
    gsap.fromTo(
      answerTextRef.value,
      { opacity: 0, y: 20 },
      {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        delay: 0.3,
      },
    )

    // 添加文字逐渐显示效果
    const textContent = answerTextRef.value.textContent
    if (textContent) {
      answerTextRef.value.innerHTML = ''
      let index = 0
      const typeWriter = () => {
        if (index < textContent.length) {
          answerTextRef.value.innerHTML += textContent.charAt(index)
          index++
          setTimeout(typeWriter, 20) // 打字速度
        }
      }
      setTimeout(typeWriter, 500)
    }
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
  detectDevice()
  initSpeechRecognition()

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)

  // 增强的入场动画
  gsap.fromTo(
    orbRef.value,
    {
      scale: 0,
      opacity: 0,
      y: 100,
      rotation: -180,
    },
    {
      duration: 1.2,
      scale: 1,
      opacity: 1,
      y: 0,
      rotation: 0,
      ease: 'back.out(1.7)',
      onComplete: () => {
        // 入场完成后的微妙呼吸动画
        gsap.to(orbRef.value, {
          duration: 3,
          scale: 1.05,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        })
      },
    },
  )

  // 光晕入场动画
  gsap.fromTo(
    glowRef.value,
    {
      scale: 0,
      opacity: 0,
    },
    {
      duration: 1.5,
      scale: 1,
      opacity: 0.3,
      ease: 'power2.out',
      delay: 0.3,
    },
  )

  // 图标入场动画
  gsap.fromTo(
    iconRef.value.$el,
    {
      scale: 0,
      rotation: 360,
    },
    {
      duration: 0.8,
      scale: 1,
      rotation: 0,
      ease: 'back.out(1.7)',
      delay: 0.5,
    },
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

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)

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
  animation: float-idle 4s ease-in-out infinite;
}

.floating-orb:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  animation: none; /* 悬停时停止浮动动画 */
}

.floating-orb:active {
  transform: translateY(0px) scale(0.98);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

@keyframes float-idle {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
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
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  border-radius: 50%;
  z-index: 0;
}

.floating-orb.recording .orb-background {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  animation: recording-pulse 1s ease-in-out infinite;
}

@keyframes recording-pulse {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

.floating-orb.thinking .orb-background {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  animation: thinking-rotate 3s linear infinite;
}

@keyframes thinking-rotate {
  0% {
    transform: rotate(0deg);
    filter: hue-rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    filter: hue-rotate(360deg);
  }
}

.floating-orb.answering .orb-background {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  animation: answering-glow 2s ease-in-out infinite;
}

@keyframes answering-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(253, 203, 110, 0.3);
    filter: brightness(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(253, 203, 110, 0.6);
    filter: brightness(1.1);
  }
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
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: scale(1.05) rotate(90deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    transform: scale(1.05) rotate(270deg);
    opacity: 0.5;
  }
}

.orb-icon {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.floating-orb:hover .orb-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.floating-orb.recording .orb-icon {
  animation: icon-bounce 0.6s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.floating-orb.thinking .orb-icon {
  animation: icon-spin 2s linear infinite;
}

@keyframes icon-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.floating-orb.answering .orb-icon {
  animation: icon-pulse 1s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
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
  animation: particle-twinkle 1.5s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}

@keyframes particle-twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
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
  transform: translateX(-8px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  animation: menu-item-glow 0.3s ease-out forwards;
}

@keyframes menu-item-glow {
  0% {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  100% {
    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(102, 126, 234, 0.3);
  }
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

.floating-orb.swiping {
  transition: transform 0.1s ease-out;
}

.swipe-hint {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0.9;
  animation: hint-bounce 2s ease-in-out infinite;
}

@keyframes hint-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

.swipe-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.swipe-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s ease-out;
  border-radius: 12px;
}

.swipe-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #333;
  z-index: 1;
}

/* 移动端特殊样式 */
@media (max-width: 768px) {
  .floating-orb-container {
    bottom: 100px;
    right: 20px;
  }

  .floating-orb {
    width: 56px;
    height: 56px;
    /* 移动端禁用用户选择 */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .floating-orb.large {
    width: 72px;
    height: 72px;
  }

  /* 移动端触摸反馈 */
  .floating-orb:active {
    transform: scale(0.95);
  }

  .swipe-hint {
    top: -35px;
    font-size: 11px;
    padding: 4px 8px;
  }

  .swipe-indicator {
    top: -50px;
    width: 100px;
    height: 20px;
  }

  .swipe-text {
    font-size: 10px;
  }
}

/* 平板设备保持原有交互 */
@media (min-width: 769px) and (max-width: 1024px) {
  .floating-orb-container {
    bottom: 90px;
    right: 25px;
  }
}

.floating-orb.hidden {
  cursor: pointer;
  /* 隐藏状态下确保可点击 */
  pointer-events: auto;
  z-index: 10000;
}

.floating-orb-container.hidden-mode {
  /* 隐藏状态下容器样式 */
  z-index: 10000;
}

.hidden-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  opacity: 0.8;
}

.upswipe-indicator {
  position: absolute;
  bottom: -70px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upswipe-progress {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transition: height 0.1s ease-out;
  border-radius: 12px;
  margin-top: auto;
}

.upswipe-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
  font-size: 9px;
  font-weight: 600;
  color: #333;
  z-index: 1;
  white-space: nowrap;
}

/* 移动端隐藏功能样式调整 */
@media (max-width: 768px) {
  .floating-orb-container.hidden-mode {
    bottom: 20px;
    right: -20px;
  }

  .upswipe-indicator {
    bottom: -60px;
    width: 20px;
    height: 60px;
  }

  .upswipe-text {
    font-size: 8px;
  }

  .hidden-hint {
    width: 12px;
    height: 12px;
  }
}

/* 桌面端隐藏功能样式 */
@media (min-width: 769px) {
  .floating-orb-container.hidden-mode {
    bottom: 40px;
    right: -10px;
  }
}

/* 隐藏状态过渡动画 */
.floating-orb-container {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加快捷键提示样式 */
.keyboard-hint {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9998;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.keyboard-hint.show {
  opacity: 1;
  transform: translateY(0);
}
</style>
