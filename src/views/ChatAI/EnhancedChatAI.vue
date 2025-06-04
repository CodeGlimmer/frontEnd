<template>
  <v-container fluid class="chat-container">
    <v-row no-gutters class="fill-height">
      <!-- API 配置侧边栏 -->
      <v-col cols="12" md="3" class="pr-3">
        <v-card
          class="h-100 d-flex flex-column tw:!shadow-m-elevation-8 tw:hover:!shadow-m-elevation-12"
          elevation="1"
          rounded="lg"
        >
          <v-card-title class="config-header">
            <v-icon left>mdi-cog</v-icon>
            配置设置
          </v-card-title>

          <v-card-text class="flex-grow-1 config-content">
            <v-form @submit.prevent="saveConfig">
              <v-text-field
                v-model="config.apiKey"
                label="DeepSeek API Key"
                type="password"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-key"
              />

              <v-text-field
                v-model="config.apiUrl"
                label="API URL"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-link"
              />

              <v-select
                v-model="config.model"
                :items="models"
                label="模型选择"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-brain"
              />

              <div class="mb-3">
                <label class="text-subtitle-2 mb-2 d-block"
                  >Temperature: {{ config.temperature }}</label
                >
                <v-slider
                  v-model="config.temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  thumb-label
                  hide-details
                  color="primary"
                />
              </div>

              <div class="mb-4">
                <label class="text-subtitle-2 mb-2 d-block"
                  >Max Tokens: {{ config.maxTokens }}</label
                >
                <v-slider
                  v-model="config.maxTokens"
                  min="100"
                  max="4000"
                  step="100"
                  thumb-label
                  hide-details
                  color="primary"
                />
              </div>

              <v-switch
                v-model="config.enableStream"
                label="启用流式响应"
                hide-details
                class="mb-4"
                color="primary"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                class="mb-3"
                variant="elevated"
              >
                <v-icon left>mdi-content-save</v-icon>
                保存配置
              </v-btn>

              <v-btn @click="clearHistory" color="error" variant="outlined" block>
                <v-icon left>mdi-delete</v-icon>
                清空记录
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 聊天主区域 -->
      <v-col cols="12" md="9" class="pl-3 chat-main-col">
        <v-card
          class="chat-main-card d-flex flex-column tw:!shadow-m-elevation-8 tw:hover:!shadow-m-elevation-12"
          elevation="1"
          rounded="lg"
        >
          <v-card-title class="chat-header flex-shrink-0">
            <v-icon left>mdi-robot</v-icon>
            DeepSeek 智能助手
            <v-spacer />
            <v-chip
              :color="isConfigured ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              rounded="lg"
            >
              <v-icon left size="small">
                {{ isConfigured ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ isConfigured ? '已就绪' : '需配置' }}
            </v-chip>
          </v-card-title>

          <!-- 聊天消息区域 -->
          <div class="chat-messages-wrapper flex-grow-1">
            <div ref="messagesContainer" class="messages-container">
              <div v-if="messages.length === 0" class="empty-state">
                <v-icon size="80" color="outline">mdi-chat-question-outline</v-icon>
                <h3 class="empty-title">开始与 DeepSeek 对话</h3>
                <p class="empty-subtitle">
                  请先配置 API 密钥，然后输入消息开始聊天<br />
                  支持 Markdown 格式和代码高亮
                </p>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ 'user-message': message.role === 'user' }"
              >
                <v-card
                  class="message-bubble"
                  :class="{ 'user-message-bubble': message.role === 'user' }"
                  elevation="1"
                  rounded="xl"
                >
                  <v-card-text class="message-body">
                    <div class="message-header">
                      <v-avatar
                        size="36"
                        :color="message.role === 'user' ? 'primary' : 'secondary'"
                        class="mr-3"
                      >
                        <v-icon color="white">
                          {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="message-role text-subtitle-2 font-weight-medium">
                          {{ message.role === 'user' ? '我' : 'DeepSeek' }}
                        </div>
                        <div class="message-time text-caption text-medium-emphasis">
                          {{ formatTime(message.timestamp) }}
                        </div>
                      </div>
                      <v-btn
                        v-if="message.role === 'assistant'"
                        @click="copyMessage(message.content)"
                        icon
                        size="small"
                        variant="text"
                        density="comfortable"
                      >
                        <v-icon size="16">mdi-content-copy</v-icon>
                      </v-btn>
                    </div>

                    <!-- 用户消息使用普通显示 -->
                    <div
                      v-if="message.role === 'user'"
                      class="message-text"
                      v-html="formatMessage(message.content)"
                    ></div>

                    <!-- AI消息使用动画显示 -->
                    <div
                      v-else
                      :ref="(el) => setMessageRef(el, message.id)"
                      class="message-text ai-message-text"
                      :data-message-id="message.id"
                    >
                      <span class="typing-cursor" v-if="message.isTyping">|</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- 加载指示器 -->
              <div v-if="loading" class="message-item">
                <v-card class="message-bubble loading-bubble" elevation="1" rounded="xl">
                  <v-card-text class="message-body">
                    <div class="message-header">
                      <v-avatar size="36" color="secondary" class="mr-3">
                        <v-icon color="white">mdi-robot</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="message-role text-subtitle-2 font-weight-medium">DeepSeek</div>
                      </div>
                    </div>
                    <div class="typing-indicator">
                      <v-progress-circular
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                        class="mr-2"
                      />
                      <span class="text-medium-emphasis">{{ loadingText }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>

          <!-- 消息输入区域 -->
          <v-divider />
          <v-card-actions class="input-area flex-shrink-0">
            <v-row no-gutters align="center">
              <v-col>
                <v-textarea
                  v-model="newMessage"
                  placeholder="输入您的问题... (支持 Markdown 格式)"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  auto-grow
                  max-rows="6"
                  hide-details
                  @keydown.ctrl.enter="sendMessage"
                  @keydown.meta.enter="sendMessage"
                  :disabled="loading"
                />
              </v-col>
              <!-- 语音输入按钮 -->
              <v-col cols="auto" class="ml-2">
                <v-btn
                  v-if="speechSupported"
                  @click="toggleSpeechRecognition"
                  :color="isListening ? 'error' : 'secondary'"
                  size="large"
                  :disabled="loading"
                  variant="elevated"
                  class="speech-btn"
                  :class="{ listening: isListening }"
                >
                  <v-icon>{{ isListening ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
                </v-btn>
                <v-tooltip v-if="!speechSupported" text="您的浏览器不支持语音识别功能">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      color="surface-variant"
                      size="large"
                      disabled
                      variant="elevated"
                      class="speech-btn"
                    >
                      <v-icon>mdi-microphone-off</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
              <v-col cols="auto" class="ml-2">
                <v-btn
                  @click="sendMessage"
                  color="primary"
                  size="large"
                  :disabled="!newMessage.trim() || !isConfigured || loading"
                  variant="elevated"
                  class="send-btn"
                >
                  <v-icon>{{ loading ? 'mdi-stop' : 'mdi-send' }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- 语音识别状态指示器 -->
            <v-row v-if="isListening" no-gutters class="mt-3">
              <v-col>
                <v-card
                  color="error-container"
                  variant="tonal"
                  rounded="lg"
                  class="speech-indicator"
                >
                  <v-card-text class="py-2 px-3">
                    <div class="d-flex align-center">
                      <v-progress-circular
                        indeterminate
                        size="20"
                        width="2"
                        color="error"
                        class="mr-2"
                      />
                      <span class="text-body-2 text-on-error-container">
                        正在听取语音输入... 请说话
                      </span>
                      <v-spacer />
                      <v-btn
                        @click="stopSpeechRecognition"
                        color="error"
                        size="small"
                        variant="text"
                        density="compact"
                      >
                        停止
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="w-100 d-flex justify-space-between align-center mt-2">
              <div class="text-caption text-medium-emphasis">
                按 Ctrl+Enter 快速发送
                <span v-if="speechSupported"> · 点击麦克风语音输入</span>
              </div>
              <div class="text-caption text-medium-emphasis">消息数: {{ messages.length }}</div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 浏览器不支持提示对话框 -->
    <v-dialog v-model="showSpeechUnsupportedDialog" max-width="400" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
          语音功能不可用
        </v-card-title>
        <v-card-text>
          <p class="mb-3">您的浏览器不支持 Web Speech API 语音识别功能。</p>
          <p class="mb-3">建议使用以下浏览器以获得最佳体验：</p>
          <v-list density="compact" class="mb-0">
            <v-list-item prepend-icon="mdi-google-chrome" title="Google Chrome" />
            <v-list-item prepend-icon="mdi-microsoft-edge" title="Microsoft Edge" />
            <v-list-item prepend-icon="mdi-apple-safari" title="Safari (macOS/iOS)" />
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="showSpeechUnsupportedDialog = false" color="primary" variant="elevated">
            我知道了
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 通知组件 -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      timeout="4000"
      location="top right"
    >
      {{ notification.message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="notification.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import {
  DeepSeekService,
  useChatConfig,
  useChatMessages,
  formatMessage,
  formatTime,
} from './chatService.js'

// 注册GSAP插件
gsap.registerPlugin(TextPlugin)

// 使用组合式函数
const {
  config,
  models,
  isConfigured,
  loadConfig,
  saveConfig: saveConfigToStorage,
} = useChatConfig()
const { messages, addMessage, loadMessages, clearMessages } = useChatMessages()

// 响应式数据
const newMessage = ref('')
const loading = ref(false)
const loadingText = ref('正在思考...')
const messagesContainer = ref(null)
const abortController = ref(null)

// 语音识别相关
const speechSupported = ref(false)
const isListening = ref(false)
const speechRecognition = ref(null)
const showSpeechUnsupportedDialog = ref(false)

// 动画相关
const messageRefs = ref(new Map())
const animationQueue = ref([])
const isAnimating = ref(false)

// 添加启用流式响应配置
config.value.enableStream = true

const notification = ref({
  show: false,
  message: '',
  type: 'info',
})

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
}

// 语音识别功能
const initSpeechRecognition = () => {
  // 检查浏览器支持
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    speechSupported.value = false
    return
  }

  speechSupported.value = true

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  speechRecognition.value = new SpeechRecognition()

  // 配置语音识别
  speechRecognition.value.continuous = false
  speechRecognition.value.interimResults = true
  speechRecognition.value.lang = 'zh-CN'
  speechRecognition.value.maxAlternatives = 1

  // 监听事件
  speechRecognition.value.onstart = () => {
    isListening.value = true
    showNotification('开始语音识别', 'info')
  }

  speechRecognition.value.onresult = (event) => {
    let finalTranscript = ''
    let interimTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    if (finalTranscript) {
      // 如果已有文本，添加空格分隔
      if (newMessage.value.trim()) {
        newMessage.value += ' ' + finalTranscript.trim()
      } else {
        newMessage.value = finalTranscript.trim()
      }
    }
  }

  speechRecognition.value.onend = () => {
    isListening.value = false
    showNotification('语音识别结束', 'success')
  }

  speechRecognition.value.onerror = (event) => {
    isListening.value = false
    let errorMessage = '语音识别出错'

    switch (event.error) {
      case 'no-speech':
        errorMessage = '未检测到语音输入'
        break
      case 'audio-capture':
        errorMessage = '无法访问麦克风'
        break
      case 'not-allowed':
        errorMessage = '麦克风权限被拒绝'
        break
      case 'network':
        errorMessage = '网络错误，请检查网络连接'
        break
      case 'service-not-allowed':
        errorMessage = '语音服务不可用'
        break
      default:
        errorMessage = `语音识别错误: ${event.error}`
    }

    showNotification(errorMessage, 'error')
  }
}

const toggleSpeechRecognition = () => {
  if (!speechSupported.value) {
    showSpeechUnsupportedDialog.value = true
    return
  }

  if (isListening.value) {
    stopSpeechRecognition()
  } else {
    startSpeechRecognition()
  }
}

const startSpeechRecognition = () => {
  if (!speechRecognition.value || loading.value) return

  try {
    speechRecognition.value.start()
  } catch (error) {
    showNotification('无法启动语音识别', 'error')
    console.error('Speech recognition error:', error)
  }
}

const stopSpeechRecognition = () => {
  if (speechRecognition.value && isListening.value) {
    speechRecognition.value.stop()
  }
}

// 方法
const saveConfig = () => {
  if (saveConfigToStorage()) {
    showNotification('配置已保存', 'success')
  } else {
    showNotification('保存配置失败', 'error')
  }
}

const clearHistory = () => {
  clearMessages()
  showNotification('聊天记录已清空', 'success')
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConfigured.value) {
    return
  }

  if (loading.value) {
    // 如果正在加载，停止当前请求
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    loading.value = false
    loadingText.value = '正在思考...'
    return
  }

  const userMessage = newMessage.value.trim()
  addMessage('user', userMessage)
  newMessage.value = ''
  loading.value = true
  loadingText.value = '正在连接...'

  await nextTick()
  scrollToBottom()

  try {
    const service = new DeepSeekService(config.value)
    abortController.value = new AbortController()

    if (config.value.enableStream) {
      // 流式响应
      const aiMessage = addMessage('assistant', '')
      aiMessage.isTyping = true
      let content = ''
      loadingText.value = '正在接收响应...'

      await service.sendStreamMessage(
        messages.value.slice(0, -1), // 不包括刚添加的空助手消息
        (chunk) => {
          content += chunk
          updateMessageWithAnimation(content)
        },
      )

      // 流式响应完成
      finalizeStreamMessage()
    } else {
      // 普通响应
      loadingText.value = '等待响应...'
      const response = await service.sendMessage(messages.value)

      if (response.choices && response.choices.length > 0) {
        addAnimatedMessage('assistant', response.choices[0].message.content)
        await nextTick()
        scrollToBottom()
      } else {
        throw new Error('API 返回数据格式错误')
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    if (error.name !== 'AbortError') {
      showNotification(`发送失败: ${error.message}`, 'error')
    }
  } finally {
    loading.value = false
    loadingText.value = '正在思考...'
    abortController.value = null
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    setTimeout(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }, 100)
  }
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    showNotification('消息已复制到剪贴板', 'success')
  } catch (err) {
    showNotification('复制失败', 'error:', err)
  }
}

const showNotification = (message, type = 'info') => {
  notification.value = {
    show: true,
    message,
    type,
  }
}

// 设置消息引用
const setMessageRef = (el, messageId) => {
  if (el) {
    messageRefs.value.set(messageId, el)
  } else {
    messageRefs.value.delete(messageId)
  }
}

// 动画相关方法
const animateText = async (element, text, speed = 30) => {
  return new Promise((resolve) => {
    // 清空元素内容
    element.innerHTML = ''

    // 创建一个临时span用于GSAP动画
    const tempSpan = document.createElement('span')
    element.appendChild(tempSpan)

    // 创建光标
    const cursor = document.createElement('span')
    cursor.className = 'typing-cursor'
    cursor.textContent = '|'
    element.appendChild(cursor)

    // 使用GSAP的TextPlugin创建打字机效果
    gsap.to(tempSpan, {
      duration: text.length / speed,
      text: {
        value: text,
        delimiter: '',
      },
      ease: 'none',
      onComplete: () => {
        // 动画完成后，设置最终的HTML内容并移除光标
        element.innerHTML = formatMessage(text)
        resolve()
      },
    })
  })
}

const animateTextWithMarkdown = async (element, text, speed = 50) => {
  return new Promise((resolve) => {
    // 对于包含Markdown的文本，我们使用逐字符显示的方式
    element.innerHTML = ''

    const formattedText = formatMessage(text)
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = formattedText

    // 提取纯文本用于动画
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    // 创建显示容器
    const displaySpan = document.createElement('span')
    element.appendChild(displaySpan)

    // 创建光标
    const cursor = document.createElement('span')
    cursor.className = 'typing-cursor'
    cursor.textContent = '|'
    element.appendChild(cursor)

    let currentIndex = 0
    const chars = plainText.split('')

    const timer = setInterval(() => {
      if (currentIndex < chars.length) {
        displaySpan.textContent += chars[currentIndex]
        currentIndex++
        scrollToBottom()
      } else {
        clearInterval(timer)
        // 动画完成后显示完整的格式化内容
        element.innerHTML = formattedText
        resolve()
      }
    }, 1000 / speed)
  })
}

const processAnimationQueue = async () => {
  if (isAnimating.value || animationQueue.value.length === 0) {
    return
  }

  isAnimating.value = true

  while (animationQueue.value.length > 0) {
    const { messageId, text } = animationQueue.value.shift()
    const element = messageRefs.value.get(messageId)

    if (element) {
      // 标记消息为正在打字
      const message = messages.value.find((m) => m.id === messageId)
      if (message) {
        message.isTyping = true
      }

      await animateTextWithMarkdown(element, text, 60)

      // 标记消息打字完成
      if (message) {
        message.isTyping = false
      }

      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  isAnimating.value = false
}

// 修改添加消息的方法以支持动画
const addAnimatedMessage = (role, content) => {
  const message = addMessage(role, content)

  if (role === 'assistant' && content) {
    // 为AI消息添加到动画队列
    nextTick(() => {
      animationQueue.value.push({
        messageId: message.id,
        text: content,
      })
      processAnimationQueue()
    })
  }

  return message
}

// 流式更新动画
const updateMessageWithAnimation = (content) => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.content = content

    const element = messageRefs.value.get(lastMessage.id)
    if (element) {
      // 直接更新内容，用于流式响应
      element.innerHTML = formatMessage(content) + '<span class="typing-cursor">|</span>'
      scrollToBottom()
    }
  }
}

const finalizeStreamMessage = () => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.isTyping = false

    const element = messageRefs.value.get(lastMessage.id)
    if (element) {
      // 移除光标
      element.innerHTML = formatMessage(lastMessage.content)

      // 添加完成动画效果
      gsap.from(element, {
        duration: 0.3,
        scale: 0.98,
        opacity: 0.8,
        ease: 'power2.out',
      })
    }
  }
}

// 监听配置变化自动保存
watch(
  config,
  () => {
    saveConfigToStorage()
  },
  { deep: true },
)

// 生命周期
onMounted(() => {
  loadConfig()
  loadMessages()
  scrollToBottom()
  initSpeechRecognition()

  // 检查是否为不支持的浏览器（如 Firefox）
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
  if (isFirefox && !speechSupported.value) {
    // 延迟显示提示，避免与初始化冲突
    setTimeout(() => {
      showSpeechUnsupportedDialog.value = true
    }, 1000)
  }

  // 为已加载的消息添加入场动画
  nextTick(() => {
    const messageElements = document.querySelectorAll('.message-item')
    gsap.from(messageElements, {
      duration: 0.6,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
    })
  })
})

onUnmounted(() => {
  // 清理语音识别
  if (speechRecognition.value && isListening.value) {
    speechRecognition.value.stop()
  }

  // 清理GSAP动画
  gsap.killTweensOf('*')
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  background-color: rgb(var(--v-theme-surface-dim));
}

/* 配置区域样式 */
.config-header {
  padding: 20px 24px 16px;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.config-content {
  padding: 24px;
  background-color: rgb(var(--v-theme-surface));
}

/* 聊天主列 */
.chat-main-col {
  height: 100%;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 聊天主卡片 */
.chat-main-card {
  height: 100%;
  max-height: 100%;
}

/* 聊天区域样式 */
.chat-header {
  padding: 20px 24px 16px;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

/* 聊天消息区域包装器 */
.chat-messages-wrapper {
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  background-color: rgb(var(--v-theme-surface));
  min-height: 0; /* 重要：确保flex子元素可以收缩 */
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.5rem;
  font-weight: 500;
  margin: 16px 0 8px;
}

.empty-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* 消息样式 */
.message-item {
  margin-bottom: 24px;
  display: flex;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
}

.user-message-bubble {
  background-color: rgb(var(--v-theme-primary-container));
  color: rgb(var(--v-theme-on-primary-container));
}

.loading-bubble {
  background-color: rgb(var(--v-theme-surface-container-low));
  color: rgb(var(--v-theme-on-surface-variant));
}

.message-body {
  padding: 20px 24px;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.message-role {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  font-size: 0.875rem;
}

.message-time {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.75rem;
  opacity: 0.8;
}

.user-message-bubble .message-role {
  color: rgb(var(--v-theme-on-primary-container));
}

.user-message-bubble .message-time {
  color: rgba(var(--v-theme-on-primary-container), 0.7);
}

/* 消息文本样式 */
.message-text {
  line-height: 1.6;
  word-wrap: break-word;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.95rem;
}

.user-message-bubble .message-text {
  color: rgb(var(--v-theme-on-primary-container));
}

/* 代码样式 */
.message-text :deep(code) {
  background-color: rgb(var(--v-theme-surface-container-high));
  color: rgb(var(--v-theme-primary));
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  border: 1px solid rgb(var(--v-theme-outline-variant));
  font-weight: 500;
}

.message-text :deep(pre) {
  background-color: rgb(var(--v-theme-surface-container-lowest));
  color: rgb(var(--v-theme-on-surface));
  padding: 16px 20px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 12px 0;
  border-left: 4px solid rgb(var(--v-theme-primary));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  box-shadow: 0 1px 3px rgba(var(--v-theme-shadow), 0.1);
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: inherit;
  font-weight: 400;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.message-text :deep(em) {
  font-style: italic;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* 用户消息的代码样式 */
.user-message-bubble .message-text :deep(code) {
  background-color: rgba(var(--v-theme-on-primary-container), 0.12);
  color: rgb(var(--v-theme-on-primary-container));
  border-color: rgba(var(--v-theme-on-primary-container), 0.24);
}

.user-message-bubble .message-text :deep(pre) {
  background-color: rgba(var(--v-theme-on-primary-container), 0.08);
  color: rgb(var(--v-theme-on-primary-container));
  border-left-color: rgb(var(--v-theme-on-primary-container));
  border-color: rgba(var(--v-theme-on-primary-container), 0.24);
}

.user-message-bubble .message-text :deep(strong) {
  color: rgb(var(--v-theme-on-primary-container));
}

.user-message-bubble .message-text :deep(em) {
  color: rgba(var(--v-theme-on-primary-container), 0.8);
}

/* 输入区域 */
.input-area {
  padding: 24px;
  background-color: rgb(var(--v-theme-surface-container-low));
  border-radius: 0 0 12px 12px;
}

/* 加载指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  font-style: italic;
  color: rgb(var(--v-theme-on-surface-variant));
}

.send-btn {
  min-width: 56px !important;
  height: 56px !important;
}

/* 语音输入按钮样式 */
.speech-btn {
  min-width: 56px !important;
  height: 56px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.speech-btn.listening {
  animation: pulse 1.5s infinite;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-error), 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--v-theme-error), 0.2);
  }
  100% {
    box-shadow: 0 0 0 12px rgba(var(--v-theme-error), 0);
  }
}

/* 语音识别状态指示器 */
.speech-indicator {
  border: 1px solid rgb(var(--v-theme-error));
  background-color: rgb(var(--v-theme-error-container)) !important;
}

.speech-indicator .v-card-text {
  color: rgb(var(--v-theme-on-error-container));
}

/* 输入区域按钮间距调整 */
.input-area .v-col:not(:first-child) {
  margin-left: 8px;
}

/* 打字光标动画 */
.typing-cursor {
  display: inline-block;
  color: rgb(var(--v-theme-primary));
  font-weight: 400;
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* AI消息文本特殊样式 */
.ai-message-text {
  position: relative;
  line-height: 1.6;
  word-wrap: break-word;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.95rem;
}

/* 用户消息的光标样式 */
.user-message-bubble .typing-cursor {
  color: rgb(var(--v-theme-on-primary-container));
}

/* 消息入场动画优化 */
.message-item {
  margin-bottom: 24px;
  display: flex;
  transform: translateY(0);
  opacity: 1;
}

/* 流式响应时的轻微呼吸效果 */
.message-bubble.streaming {
  animation: breathing 2s ease-in-out infinite;
}

@keyframes breathing {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.005);
  }
}

/* 改进的淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 文本高亮效果（用于代码和重要内容） */
.ai-message-text :deep(code),
.ai-message-text :deep(strong) {
  animation: highlightFade 0.3s ease-out;
}

@keyframes highlightFade {
  0% {
    background-color: rgba(var(--v-theme-primary), 0.3);
  }
  100% {
    background-color: transparent;
  }
}

/* 响应式优化 */
@media (max-width: 600px) {
  .typing-cursor {
    font-size: 0.9rem;
  }
}

/* 确保在暗色主题下光标可见 */
@media (prefers-color-scheme: dark) {
  .typing-cursor {
    color: rgb(var(--v-theme-secondary));
  }

  .user-message-bubble .typing-cursor {
    color: rgb(var(--v-theme-on-primary-container));
  }
}
</style>
